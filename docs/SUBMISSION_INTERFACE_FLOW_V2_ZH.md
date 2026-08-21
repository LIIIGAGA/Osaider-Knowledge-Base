# Submission 上缴与骰子鉴定界面实现方案 V2（中文版）

项目：Osaider  
引擎：Unreal Engine 5.6  
目标：在保留现有 Inventory、Submission、Dice Check 和 Module Reveal 系统的基础上，把旧的右上角三槽界面升级为中央圆形上缴界面，并加入 1.5 秒旋转鉴定动画。

---

## 1. 最终玩家流程

### 1.1 第一次上缴与鉴定

1. 游戏开始时，三个初始模块已经放置在场景中，并且保持可见、可交互。
2. 玩家分别第一次成功触发这三个初始模块。
3. 每个模块第一次成功触发时，向 `BP_CoreDevice` 报告一次，不能重复计数。
4. 玩家通过这些模块获得物品，物品继续进入现有 Inventory 数组。
5. 同时满足以下两个条件后，Submission 功能进入可用状态：
   - 三个不同的初始模块都已经被触发；
   - Inventory 中至少有三个可以上缴的有效物品。
6. 复用之前的 Prompt 功能，显示：`D  OPEN SUBMISSION`。
7. 玩家第一次按 D 时，不直接打开中央圆形界面，而是提示玩家点击右上角红色图标：
   - 红色图标播放一次闪烁或轻微缩放动画；
   - 图标旁显示短提示，例如 `CLICK TO START CHECK`。
8. 玩家点击右上角红色图标后，打开屏幕中央的 `WBP_SubmissionPanel`。
9. 玩家点击三个小圆中的任意一个：
   - 记录当前槽位编号；
   - 打开现有 `WBP_InventoryPanel`；
   - 调用现有 `InitInventory` 刷新物品。
10. 玩家点击 Inventory 中的物品后，该物品被放入对应圆形槽位。
11. 三个槽位都填满后，中央红色圆按钮进入可点击状态。
12. 玩家点击中央红色圆按钮：
   - 三个槽位和中央按钮立即锁定；
   - 计算骰子结果与对应阵营；
   - 选出即将显示的模块，但暂时不显示；
   - 下层外侧大圆开始旋转。
13. 外侧大圆旋转 1.5 秒，使用缓入缓出；三个物品槽、物品图标、三角线和中央按钮保持不动。
14. 旋转彻底停止后，才 Reveal 场景中预先放置、初始隐藏的目标模块。
15. 模块成功显示后，Submission 界面用约 0.35–0.50 秒缓慢淡出。
16. 恢复游戏输入，玩家继续探索新模块。

### 1.2 后续上缴与鉴定

- 第一次教学流程完成后，只要 Submission 再次满足开启条件，玩家按 D 直接打开中央圆形界面。
- 右上角红色图标仍然可以作为鼠标入口。
- 界面正在鉴定或淡出时，忽略 D 键，防止重复打开。

---

## 2. 保留现有系统职责

## 2.1 `BP_NoCharacterPlayerController`

只负责输入与 UI 模式，不放入骰子或模块选择逻辑。

需要增加：

- Enhanced Input Action：`IA_OpenSubmission`
- 按键映射：D
- Submission Widget 引用：`SubmissionPanelRef`
- 是否正在进行 UI 操作：`bUIInteractionLocked`
- 读取 `BP_CoreDevice.SubmissionTutorialState`（不要在 Controller 保存另一份教学 Boolean）

主要职责：

1. 接收 D 输入。
2. 调用 `BP_CoreDevice.CanOpenSubmission` 判断是否允许开启。
3. 第一次按 D 时，引导右上角红色图标。
4. 后续按 D 时，直接调用 `OpenSubmissionPanel`。
5. 面板打开时切换为 `Set Input Mode Game and UI`。
6. 显示鼠标，并把焦点给 `WBP_SubmissionPanel`。
7. 面板打开期间停止场景 Hover、点击、拖拽和相机控制。
8. 面板关闭后恢复原来的游戏输入模式。

不要把以下逻辑移入 PlayerController：

- `SubmittedItems`
- 骰子计算
- Ideology 计算
- 阵营判断
- 模块筛选与 Reveal

---

## 2.2 `BP_CoreDevice`

继续负责：

- `SubmittedItems`
- `AreAllSlotsFilled`
- `Roll2D6`
- `IdeologySum`
- `FinalScore`
- 阵营结果
- 按 Tag 筛选模块
- 排除已经显示过的模块
- 清空临时上缴数据

新增变量：

- `PendingRevealModule`：Actor Reference
- `bCheckInProgress`：Boolean
- `TriggeredInitialModules`：Actor Array 或 ID Set
- `RequiredInitialModuleCount`：Integer，默认 3
- `SubmissionTutorialState`：`E_SubmissionTutorialState`
- `OnSubmissionTutorialStateChanged`
- `bSubmissionAvailable`：Boolean

### 为什么要拆分原来的 `BeginCheck`

旧流程会在调用 `BeginCheck` 后立刻显示模块，但现在要求先播放 1.5 秒动画。因此建议将原流程拆成两个阶段：

```text
点击中央按钮
→ PrepareDiceCheck
→ 播放 1.5 秒旋转
→ Animation Finished
→ CommitPendingReveal
→ 模块显示
→ 面板淡出
```

### 新函数：`PrepareDiceCheck`

输出：

- `Success`：Boolean
- 可选 `FailureReason`：Text 或 Enum

节点顺序：

1. 如果 `bCheckInProgress == true`，直接返回失败。
2. 调用 `AreAllSlotsFilled`。
3. 检查三个提交物品引用是否有效。
4. 检查三个物品是否互不重复。
5. 计算 `Roll2D6`。
6. 汇总三个物品的 Ideology Value。
7. 计算 `FinalScore = Roll2D6 + IdeologySum`。
8. 根据 Threshold 得出 Archivist 或 Whalemen。
9. 使用现有 Tag 查找对应阵营的可用模块。
10. 排除 `SpawnedModules`／已经 Reveal 的模块。
11. 随机选择一个有效 Actor。
12. 保存到 `PendingRevealModule`。
13. 设置 `bCheckInProgress = true`。
14. 返回成功。

此函数中绝对不要：

- `SetActorHiddenInGame(false)`；
- Enable Collision；
- 播放面板淡出；
- 清空 `SubmittedItems`。

### 新函数：`CommitPendingReveal`

输出：`Success` Boolean

节点顺序：

1. `IsValid(PendingRevealModule)`。
2. 优先调用项目当前使用的 Reveal 函数或 `BPI_SpawnReveal`。
3. 如果当前模块仍使用旧方式，则执行：
   - `SetActorHiddenInGame(false)`；
   - 恢复或启用 Collision。
4. 将模块加入 `SpawnedModules` 或 Revealed Set。
5. 清空 `PendingRevealModule`。
6. 调用现有清理函数，清空三个上缴槽和临时 Ideology 值。
7. 设置 `bCheckInProgress = false`。
8. Broadcast `OnModuleRevealCommitted`。
9. 返回成功。

### 关于“Spawn 模块”

玩家体验上可以称为“生成新模块”，但技术实现继续遵循当前项目架构：

- 模块提前放在 Level 中；
- `BeginPlay` 时隐藏并关闭 Collision；
- 骰子鉴定完成后 Reveal。

不要把主要故事模块改成运行时 `SpawnActor`，否则容易破坏已有引用、Spline、InteractionPoint 和模块内部组件。

---

## 2.3 三个初始模块

仅关卡中三个指定初始模块实例设置：

```text
bCountsTowardInitialUnlock = true
```

后续模块的 Class Default 保持 false。初始模块在 `GrantItem_Event` 的 Inventory `ADD` 成功后、创建 Item Popup 前，且仅第一次调用：

`BP_CoreDevice.NotifyInitialModuleTriggered(Self)`

`NotifyInitialModuleTriggered`：

1. 先检查 `SubmissionTutorialState == CollectingInitialItems`，否则立即 Return。
2. 检查 `TriggeredInitialModules` 是否已经包含该 Actor。
3. 如果没有，执行 `Add Unique`。
4. 三个初始模块与三个有效物品都满足时，把状态设为 `WaitingForFirstD`。

模块侧还应使用 `bHasReportedInitialTrigger` 防止当前 Actor 实例重复上报。不要在 `RevealModuleGroup`、`HideModuleGroup` 或 `SetAlreadyRevealed` 中调用教学通知。

开启条件：

```text
TriggeredInitialModules.Num >= 3
AND ValidInventoryItemCount >= 3
AND bCheckInProgress == false
```

即使每个初始模块必然给一个物品，也建议保留模块触发计数，避免测试时通过 Debug 物品提前跳过第一轮教学。

---

## 2.4 `WBP_InventoryPanel`

继续复用现有：

- `InitInventory`
- Inventory Array
- 现有物品按钮或条目

新增或确认变量：

- `SubmissionPanelRef`
- `ActiveSlotIndex`
- `ExcludedSubmittedItems`

Inventory 物品按钮点击流程：

1. 检查该物品是否已经存在于另外两个 Submission 槽位。
2. 如果重复，禁止选择或显示短提示。
3. 如果有效，调用：

   `SubmissionPanelRef.AssignItemToSlot(ActiveSlotIndex, ItemData)`

4. 关闭或收起 Inventory。
5. 把输入焦点交还给 Submission 面板。

不要在 Widget 内复制一份永久 Inventory 数据；Widget 只读取现有 Inventory 数据源。

---

## 3. `WBP_SubmissionPanel` 层级结构

```text
WBP_SubmissionPanel
└─ Canvas_Root（全屏）
   ├─ Button_BackdropBlocker
   └─ Overlay_Submission（屏幕中央）
      ├─ Image_OuterRing
      ├─ Image_InnerLineArt
      ├─ Button_Slot0
      │  └─ Image_Item0
      ├─ Button_Slot1
      │  └─ Image_Item1
      ├─ Button_Slot2
      │  └─ Image_Item2
      ├─ Button_Check
      └─ WBP_InventoryPanel（也可在外部单独创建）
```

### 推荐纹理

- 旋转外圈：`WBP_SubmissionPanel_v2_OuterRing_RotationSquare.png`
- 内层线稿：`WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle_LineArt_NoBlackEdge.png`

旋转外圈是 `941 × 941` 正方形透明 PNG，专门用于避免长方形纹理旋转时被裁切。

### 原设计稿参考坐标

设计画布：`1672 × 941`

- Slot 0 中心：约 `(594, 303)`
- Slot 1 中心：约 `(1076, 303)`
- Slot 2 中心：约 `(835, 703)`
- 中央按钮中心：约 `(835, 452)`
- 外圈视觉旋转中心：约 `(835, 470)`

三个槽位和中央按钮都使用透明 UMG Button 覆盖在美术线稿上；不要让 PNG 本身承担点击逻辑。

---

## 4. Submission UI 状态机

建议创建 Enum：`E_SubmissionUIState`

- `Closed`：关闭
- `Selecting`：选择物品
- `Ready`：三个槽位已填满
- `Checking`：正在播放鉴定动画
- `FadingOut`：正在淡出

Widget 变量：

- `CoreDeviceRef`
- `PlayerControllerRef`
- `InventoryPanelRef`
- `ActiveSlotIndex`
- `SubmissionState`

### 槽位点击事件

`Button_Slot0 / 1 / 2 → OnClicked`

1. 只允许 `Selecting` 或 `Ready` 状态。
2. 设置 `ActiveSlotIndex`。
3. 创建或显示 `WBP_InventoryPanel`。
4. 传入 `SubmissionPanelRef = Self`。
5. 传入 `ActiveSlotIndex`。
6. 调用 `InitInventory`。
7. 将当前已使用的物品传入，以便禁用重复选择。

### 回填物品事件

新函数：`AssignItemToSlot(Index, ItemData)`

1. 通过现有 Setter 或新增小型 Setter 更新 `BP_CoreDevice.SubmittedItems[Index]`。
2. 更新对应 `Image_ItemN` Brush。
3. 设置图标可见。
4. 调用 `RefreshSubmissionState`。
5. 如果 `AreAllSlotsFilled == true`：
   - `SubmissionState = Ready`；
   - 中央按钮启用；
   - 中央按钮可播放轻微呼吸动画。
6. 否则保持 `Selecting`。

### 中央按钮点击事件

`Button_Check → OnClicked`

1. 检查 `SubmissionState == Ready`。
2. 立即 Disable 三个 Slot Button 和 Check Button。
3. 如果 Inventory 正在打开，先关闭 Inventory。
4. 调用 `CoreDeviceRef.PrepareDiceCheck`。
5. 如果返回失败：
   - 恢复按钮；
   - 根据实际槽位重新设置 `Selecting` 或 `Ready`；
   - 显示短错误提示。
6. 如果成功：
   - `SubmissionState = Checking`；
   - 播放 `Anim_CheckSequence`。

---

## 5. 旋转与淡出动画

## 5.1 `Anim_CheckSequence`

总时长：1.5 秒  
只给 `Image_OuterRing` 添加 Render Transform Angle 轨道。

推荐关键帧：

- `0.000 s`：`0°`
- `0.375 s`：`56.25°`
- `0.750 s`：`180°`
- `1.125 s`：`303.75°`
- `1.500 s`：`360°`

这些角度近似 Smoothstep 曲线：

- 开始慢；
- 中间速度快；
- 结束慢；
- 停止时不会突然卡住。

在 UMG Animation 中把关键帧插值设为 Cubic／Auto。

正方形旋转素材 Pivot：

- X：`0.5`
- Y：`0.5`

注意：

- 只旋转 `Image_OuterRing`；
- 三个槽位不转；
- 三个物品图标不转；
- 三角形不转；
- 中央按钮不转。

可选辅助动画：

- 中央按钮 Scale：`1.00 → 0.96 → 1.00`
- 红色轻微明暗脉冲
- 播放一次机械运转音效

### `Anim_CheckSequence` 播放完成

必须绑定这个动画的 Finished 事件：

1. 调用 `CoreDeviceRef.CommitPendingReveal`。
2. 如果成功，播放 `Anim_PanelFadeOut`。
3. 如果失败：
   - 不清空物品；
   - 恢复界面；
   - `SubmissionState = Ready`；
   - 重新启用中央按钮。

## 5.2 `Anim_PanelFadeOut`

时长：0.35–0.50 秒

- `Canvas_Root.RenderOpacity`：`1 → 0`
- 可选 Scale：`1.00 → 0.985`
- 使用 Ease Out

动画结束：

1. `Remove From Parent` 或 Set Visibility Collapsed。
2. 清空 `SubmissionPanelRef`，或保留并复用同一个 Widget。
3. 恢复 `Set Input Mode Game Only`。
4. 恢复世界 Hover、点击、拖拽和相机输入。

只有 `CommitPendingReveal` 成功后才能播放淡出。

---

## 6. 第一次 D 键引导与右上角入口

右上角红色图标建议放在常驻 HUD 中，并用：

`Button_SubmissionLauncher`

包裹。

当 `BP_CoreDevice` 判断 Submission 可用时 Broadcast：

`OnSubmissionAvailabilityChanged(true)`

### 第一次流程

1. `WBP_InputPrompt.ShowPrompt(D, "OPEN SUBMISSION")`。
2. 玩家按 D。
3. 不直接打开面板。
4. 右上角图标播放 `Anim_LauncherAttention`：
   - 轻微放大；
   - 红色脉冲；
   - 短暂青色错位闪烁。
5. 图标旁显示 `CLICK TO START CHECK`。
6. 玩家点击图标。
7. 调用 `OpenSubmissionPanel`。
8. `OpenSubmissionPanel` 成功返回后调用 `SetSubmissionTutorialState(Completed)`；创建失败则保持 Pointing 状态以便重试。

### 后续流程

如果 CoreDevice 教学状态为 `Completed`：

`IA_OpenSubmission(D) → CanOpenSubmission → OpenSubmissionPanel`

右上角图标依然可以点击打开面板。

`Completed` 不得被 Commit、Reset 或后续循环清理。后续 Reveal/Spawn 的模块即使错误调用通知，也会被 CoreDevice 的状态入口拒绝，因此不会再次出现教学 UI。

---

## 7. 输入与焦点规则

面板打开时：

- `Set Input Mode Game and UI`
- `Show Mouse Cursor = true`
- `Set User Focus` 到 `WBP_SubmissionPanel`
- `bUIInteractionLocked = true`
- 停止场景 Hover Trace
- 停止 LMB 世界点击和 Drag
- 停止 RMB 相机移动

面板关闭后：

- `Set Input Mode Game Only`
- 根据现有游戏规则决定是否隐藏鼠标
- `bUIInteractionLocked = false`
- 恢复场景交互与相机控制

`Checking` 和 `FadingOut` 状态中：

- D 无效
- 槽位点击无效
- Inventory 不能打开
- 面板不能手动关闭
- 中央按钮不能再次触发

---

## 8. 必须处理的异常情况

### 物品不足三个

- 不显示 Submission Ready Prompt。
- D 不打开界面。

### 重复物品

- Inventory 中直接 Disable 已被另外槽位使用的物品。
- `PrepareDiceCheck` 再验证一次，不能只相信 UI。

### 对应阵营没有可用模块

- `PrepareDiceCheck` 在动画开始前返回失败。
- 不消耗物品。
- 不播放旋转。
- 显示短系统提示。

### 动画期间 Pending Module 失效

- `CommitPendingReveal` 返回失败。
- 面板恢复为 Ready。
- 保留三个物品。

### 玩家连续按 D

- 如果 `SubmissionPanelRef` 有效，只把已有面板带到前景。
- 禁止创建第二个面板。

### 玩家快速连续点击中央按钮

- 第一次点击时立即 Disable Button。
- 同时通过 `bCheckInProgress` 在逻辑层二次阻止。

### Level 切换或面板被强制移除

- 清空 `PendingRevealModule`。
- 重置 `bCheckInProgress`。
- 恢复输入模式。

### Submitted Items 是否消耗

- 保持当前项目原有规则。
- 不要在本次 UI 改造中擅自改变物品的永久生命周期。

---

## 9. 推荐实施顺序

1. 增加 D 输入和单实例面板开关逻辑。
2. 用三个透明 Button 覆盖三个圆形槽位。
3. 重新接通：Slot Click → `InitInventory` → Item Click → 回填槽位。
4. 禁用或删除原来的 Enter-to-Check 入口。
5. 把原 `BeginCheck` 拆成 `PrepareDiceCheck` 与 `CommitPendingReveal`。
6. 导入正方形外圈纹理并完成 1.5 秒旋转。
7. 在动画 Finished 后调用 `CommitPendingReveal`。
8. 加入 Reveal 成功后的面板淡出。
9. 完成第一次 D → 红色图标的教学引导。
10. 完整测试第一轮和至少两轮后续循环。

---

## 10. 验收清单

- [ ] 三个初始模块在游戏开始时可见且可交互。
- [ ] 只有三个指定初始实例具有教学计数资格。
- [ ] 每个初始模块只在 Inventory ADD 后记录一次。
- [ ] Reveal/Hide 函数不会触发教学。
- [ ] 未满足三个模块和三个物品时，不显示 Ready Prompt。
- [ ] 第一次按 D 会引导右上角红色图标。
- [ ] 点击红色图标只创建一个中央 Submission 面板。
- [ ] 三个小圆分别打开 Inventory 并回填正确槽位。
- [ ] 同一物品不能进入两个槽位。
- [ ] 三槽未满时中央按钮不可点击。
- [ ] Enter 不再触发骰子鉴定。
- [ ] 点击中央按钮只触发一次 1.5 秒旋转。
- [ ] 动画具有明显缓入缓出。
- [ ] 旋转期间没有任何新模块提前显示。
- [ ] 旋转结束后只 Reveal 一个有效模块。
- [ ] Reveal 成功后面板才淡出。
- [ ] 后续按 D 可以直接打开 Submission 面板。
- [ ] 教学状态完成后始终保持 Completed，后续循环不会重播教学。
- [ ] 不会出现重复 Widget、重复 Dice Check 或重复模块 Reveal。
