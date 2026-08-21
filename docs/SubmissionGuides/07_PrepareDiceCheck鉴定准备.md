# 第 07 部分：`PrepareDiceCheck` 鉴定准备阶段

## 本部分目标

把旧 `BeginCheck` 拆出“验证、掷骰、计算阵营、选择模块”的部分。

这一阶段结束时：

- 骰子结果已经算好；
- 阵营已经确定；
- 即将 Reveal 的模块已经保存在 `PendingRevealModule`；
- 但是场景中的模块仍然隐藏；
- `SubmittedItems` 尚未清空。

`PrepareDiceCheck` 只能由第 08 部分的中央 `Button_Check` 流程调用。不要把它连接到 D 键、右上角红色图标或 `OpenSubmissionPanel`；这三个位置都只是面板入口，不是鉴定入口。

## 1. 先整理旧 `BeginCheck`

打开 `BP_CoreDevice`，找到旧 `BeginCheck`。

先用 Comment Box 把节点分成：

1. Validate Slots。
2. Roll 2D6。
3. Sum Ideology。
4. Calculate FinalScore。
5. Determine Faction。
6. Find Module。
7. Reveal Module。
8. Clear Submission。

不要直接删除节点。

把第 7、8 部分暂时断开，并标记：

`MOVE TO CommitPendingReveal`

## 2. 新增变量

### `PendingRevealModule`

- 类型：Actor Object Reference。
- 默认：None。

### `PendingFactionTag`

- 类型：Name。
- 可选，但推荐用于调试。

### `PendingRoll2D6`

- Integer。
- 可选；如果旧变量 `Roll2D6` 已存在，继续复用。

### `PendingIdeologySum`

- Integer 或 Float，跟当前项目一致。

### `PendingFinalScore`

- Integer 或 Float，跟当前项目一致。

### `bCheckInProgress`

- Boolean。
- 第 02 部分已创建则复用。

### `LastCheckFailureReason`

- Text 或自定义 Enum。
- 可选，但非常利于 UI 提示。

## 3. 创建 `ValidateSubmittedItems`

新建 Function：

`ValidateSubmittedItems`

输出：

- `IsValidSubmission`：Boolean。
- `FailureReason`：Text 可选。

节点顺序：

1. 调用 `AreAllSlotsFilled`。
2. False → 返回：`Fill all three slots`。
3. 检查数组 Length 至少为 3。
4. 逐个检查三个 ItemData 是否有效。
5. 按唯一 ID 检查 0、1、2 是否有重复：

```text
ID0 != ID1
AND ID0 != ID2
AND ID1 != ID2
```

6. 检查这些物品是否允许 Submission。
7. 全部通过返回 True。

即使 UI 已禁止重复，这里仍然必须验证，防止数据层被其他路径写入。

## 4. 创建 `GetFactionTagFromScore`

新建 Function：

`GetFactionTagFromScore`

输入：

- `InFinalScore`。

输出：

- `FactionTag`：Name。

根据当前项目 Threshold：

```text
InFinalScore >= DiceThreshold
→ Spawn_Archivist_Phase1
否则
→ Spawn_Whalemen_Phase1
```

如果项目已根据 Phase 动态组合 Tag，保留现有方法，不要写死 Phase1。

## 5. 创建“只选择、不 Reveal”的模块函数

新建 Function：

`FindPendingModuleByTag`

输入：

- `FactionTag`：Name。

输出：

- `FoundModule`：Actor Reference。
- `Success`：Boolean。

推荐节点：

```text
Get All Actors with Tag(FactionTag)# 第 08 部分：中央按钮与 1.5 秒旋转动画

## 本部分目标

让中央红色圆按钮取代 Enter，点击后：

1. 锁定全部 Submission 输入。
2. 调用 `PrepareDiceCheck`。
3. 成功后只旋转外侧大圆。
4. 动画严格持续 1.5 秒。
5. 使用缓入缓出。
6. 动画结束前不 Reveal 模块。

入口职责必须保持：

```text
D 键 / 右上角红色图标 → 只打开 SubmissionPanel
中央 Button_Check      → 唯一的 StartCheckSequence 入口
```

## 1. 删除临时 Check Print

打开 `WBP_SubmissionPanel`，找到：

`Button_Check.OnClicked`

移除第 05 部分的临时 Print，准备连接正式逻辑。

## 2. 创建 `SetSubmissionInteractionEnabled`

新建 Function：

`SetSubmissionInteractionEnabled`

输入：

- `bEnabled`：Boolean。

节点：

```text
Set Is Enabled(Button_Slot0, bEnabled)
→ Button_Slot1
→ Button_Slot2
→ Button_Check
```

注意：恢复时中央按钮是否 Enable 仍应由 `RefreshSubmissionState` 最终决定。

## 3. 创建 `StartCheckSequence`

新建 Function 或 Custom Event：

`StartCheckSequence`

节点顺序：

```text
SubmissionState == Ready
→ Branch
  False → Return
  True
    → Set SubmissionState = Checking
    → SetSubmissionInteractionEnabled(False)
    → 如果 InventoryPanelRef Valid：Close/Collapse Inventory
    → CoreDeviceRef.PrepareDiceCheck
    → Branch(Success)
      False
        → Set SubmissionState = Ready
        → Set Slot Buttons Enabled True
        → RefreshSubmissionState
        → 显示 FailureReason
      True
        → Play Animation(Anim_CheckSequence, Start 0, Loop 1)
```

先设置 State 和 Disable，再调用 Prepare，可以阻止快速双击。

## 4. 连接中央按钮

```text
Button_Check OnClicked
→ StartCheckSequence
```

确认旧 Enter Input 已断开。

同时确认 `HandleOpenSubmissionInput`、HUD 红色图标 `OnClicked` 和 `OpenSubmissionPanel` 都没有连接 `StartCheckSequence` 或 `PrepareDiceCheck`。

## 5. 创建 `Anim_CheckSequence`

在 Widget Designer → Animations：

1. 新建 Animation。
2. 命名：`Anim_CheckSequence`。
3. 长度设置为 1.5 秒。
4. Add Track → `Image_OuterRing`。
5. Add Render Transform → Angle。

## 6. 设置外圈 Pivot

选择 `Image_OuterRing`：

- Render Transform Pivot X：0.5。
- Render Transform Pivot Y：0.5。

确认素材为：

`T_UI_Submission_OuterRing_Rotation`

尺寸必须等宽等高。

## 7. 添加角度关键帧

添加以下 Key：

```text
0.000 s   0°
0.375 s   56.25°
0.750 s   180°
1.125 s   303.75°
1.500 s   360°
```

这些值近似 Smoothstep 的运动关系：

- 0–0.375 秒缓慢加速；
- 中间快速旋转；
- 1.125–1.5 秒缓慢停止。

在 Curve Editor 或 Key 属性中选择：

- Cubic；
- Auto Tangent；
- 或 UE 当前版本相同含义的自动平滑插值。

不要使用 Linear，否则开始和停止会显得突然。

## 8. 确保只有外圈旋转

动画轨道中只能把以下控件加入 Angle：

- `Image_OuterRing`。

不要加入：

- `Image_InnerLineArt`；
- `Button_Slot0/1/2`；
- `Image_Item0/1/2`；
- `Button_Check`。

## 9. 可选中央按钮反馈

在同一个动画中可以添加 `Button_Check` 或内部 Image 的 Scale：

```text
0.00 s  1.00
0.12 s  0.94
0.28 s  1.00
```

只做一次按压反馈，不要让按钮跟着旋转。

## 10. 可选声音

在 `StartCheckSequence` Prepare 成功后：

- `Play Sound 2D`：机械启动音。

在动画结束：

- 播放机械停止或锁定音。

声音总长度最好接近 1.5 秒，避免听觉和动画不同步。

## 11. 绑定动画结束事件

在 Graph 中选择 `Anim_CheckSequence`，添加：

- `On Animation Finished`；或
- 使用 `Bind to Animation Finished`。

创建事件：

`HandleCheckAnimationFinished`

当前先连接：

```text
Print String "ROTATION FINISHED"
```

第 09 部分再接 `CommitPendingReveal`。

确保只响应 `Anim_CheckSequence`，不要让其他动画 Finished 也触发 Reveal。

## 12. 动画重复播放安全

在 Start 前检查：

- `SubmissionState == Ready`；
- `bCheckInProgress` False（CoreDevice 内再检查）；
- `Is Animation Playing(Anim_CheckSequence)` False。

第一次点击后 Button 立即 Disable。

## 13. 本部分测试

### 未填满三槽

- 中央按钮 Disabled。
- 点击不会调用 Prepare。

### 三槽填满

- Button Enabled。
- 点击一次后立即 Disable。
- 三个槽位也不能继续点击。
- Inventory 如果打开则关闭。

### 动画

- 总时长 1.5 秒。
- 开始慢、中间快、停止慢。
- 外圈圆心不晃动。
- 外圈不被裁切。
- 三圆、物品和三角形完全静止。

### 快速连点

- 只播放一次动画。
- 只产生一个 Pending Module。

## 14. 常见错误

### 外圈绕错位置转

- 检查正方形素材；
- Pivot 0.5,0.5；
- 检查 Image 是否非等比缩放；
- 检查素材是否放在正确视觉中心。

### 动画结束时突然跳回 0°

360° 和 0°视觉相同，通常不影响；如果有微小跳动：

- 确保最后一帧是精确 360；
- 动画完成后手动 Set Render Transform Angle = 0；
- 该设置应在视觉已经停止后执行。

### 点击后没有动画

- Prepare 可能返回失败；
- 打印 FailureReason；
- 确认 `SubmissionState` 是 Ready；
- 确认动画引用正确。

## 15. 本部分验收

- [ ] 中央按钮取代 Enter。
- [ ] 三槽未满时不可点击。
- [ ] 点击后立刻锁定全部操作。
- [ ] Prepare 失败时安全恢复。
- [ ] Prepare 成功后播放一次动画。
- [ ] 只有外圈旋转。
- [ ] 动画严格 1.5 秒且缓入缓出。
- [ ] 动画结束前模块仍然隐藏。
- [ ] D 键和右上角红色图标只打开面板，不会启动旋转。
- [ ] 只有中央 Button_Check 调用 StartCheckSequence。

→ For Each Loop
   → Is Valid(Array Element)
   → SpawnedModules Contains Array Element
   → NOT Contains 才 Add 到 Local AvailableModules
→ Length(AvailableModules) > 0
→ Branch
  False → Success False
  True
    → Random Integer in Range(0, Length-1)
    → Get AvailableModules[Index]
    → FoundModule
    → Success True
```

如果模块自身有 `bAlreadyRevealed`，建议同时检查：

- 已 Reveal 的模块不加入候选；
- `SpawnedModules` 与模块自身状态双保险。

这个函数中禁止调用：

- `RevealModuleGroup`；
- `SetActorHiddenInGame(false)`；
- Enable Collision。

## 6. 创建 `PrepareDiceCheck`

新建 Function：

`PrepareDiceCheck`

输出：

- `Success`：Boolean。
- `FailureReason`：Text 可选。

### 完整节点顺序

```text
Function Entry
→ Branch(bCheckInProgress)
  True
    → FailureReason = "Check already running"
    → Success = False
    → Return
  False
    → ValidateSubmittedItems
    → Branch(IsValidSubmission)
      False
        → Set LastCheckFailureReason
        → Success False
        → Return
      True
        → 计算 Roll2D6（复用旧节点）
        → 遍历 SubmittedItems 计算 IdeologySum（复用旧节点）
        → FinalScore = Roll2D6 + IdeologySum
        → GetFactionTagFromScore(FinalScore)
        → Set PendingFactionTag
        → FindPendingModuleByTag(PendingFactionTag)
        → Branch(Found Success)
          False
            → LastCheckFailureReason = "No module available"
            → Success False
            → Return
          True
            → Set PendingRevealModule = FoundModule
            → Set PendingRoll / PendingIdeology / PendingFinalScore
            → Set bCheckInProgress = True
            → RefreshSubmissionAvailability
            → Print Pending Module Name
            → Success True
            → Return
```

## 7. 关于骰子结果显示

如果旧界面有骰子结果 Widget：

- 可以在 Prepare 后保存结果；
- 不要在旋转动画结束前显示最终模块；
- 结果文字可以在旋转中或停止后显示，取决于视觉设计。

本次最重要的约束是：模块 Reveal 必须延迟到动画完成。

## 8. 暂时建立测试入口

在 `BP_CoreDevice` 创建临时 Custom Event：

`TEST_PrepareDiceCheck`

连接：

```text
TEST_PrepareDiceCheck
→ PrepareDiceCheck
→ Print Success
→ Is Valid(PendingRevealModule)
→ Print Actor Display Name
```

不要连接 Reveal。

## 9. 本部分测试

### 槽位未满

- `PrepareDiceCheck` 返回 False。
- `PendingRevealModule` 仍 None。
- `bCheckInProgress` False。

### 重复物品

- 返回 False。
- 不进行骰子计算或模块选择。

### 三个有效物品

- 返回 True。
- Roll、Ideology、FinalScore 有合理值。
- `PendingRevealModule` 有效。
- 该 Actor 仍处于 Hidden 状态。
- Collision 仍保持关闭。
- `SubmittedItems` 仍然保留。

### 对应阵营没有可用模块

- 返回 False。
- 不播放后续动画。
- 不清空物品。

## 10. 常见错误

### Prepare 一执行模块就出现

- 旧 `RevealModuleGroup` 仍接在函数中；
- 查找函数里误调用 Reveal；
- 旧 `BeginCheck` 同时仍从其他输入执行。

### Pending Module 总是同一个

- `SpawnedModules` 过滤还没在后续 Commit 加入；
- Random Range 上限应为 `Length - 1`；
- 候选数组可能每次没有 Clear。

### 对应 Tag 找不到 Actor

- 检查 Actor Tags，而不是 Component Tags；
- 检查 Name 拼写和 Phase；
- 在 Level 中确认目标模块确实预先放置。

## 11. 本部分验收

- [ ] 旧 `BeginCheck` 已分区保留。
- [ ] Prepare 能验证三个物品。
- [ ] Prepare 能计算现有骰子公式。
- [ ] Prepare 能选出未使用模块。
- [ ] Pending Actor 在 Prepare 后仍然隐藏。
- [ ] Prepare 不清空槽位。
- [ ] 无可用模块时安全失败。
- [ ] D 键和右上角红色图标不会调用 Prepare。
- [ ] `OpenSubmissionPanel` 不会调用 Prepare。
