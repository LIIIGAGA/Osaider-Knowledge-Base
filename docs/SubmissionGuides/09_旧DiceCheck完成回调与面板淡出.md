# 09 旧 DiceCheck 完成回调、物品结算与界面淡出

本版本与以下规则兼容：

- 鉴定继续使用旧 `BP_CoreDevice.BeginCheck / DiceCheck`；
- 旧逻辑继续负责 Roll、IDEO Sum、Threshold、阵营 Tag 和 Reveal；
- 三个槽位允许使用相同物品；
- UI 不再调用新的 `CommitReveal`；
- 只有旧 `BeginCheck` 确认 Reveal 成功后，面板才淡出。

> 原 09 文档中的 `CommitReveal` 依赖 `PrepareDiceCheck` 预先保存 Pending Module。当前方案不再创建 Pending 数据，因此必须改为监听旧 `BeginCheck` 的最终结果。

## 1. 最终执行顺序

```text
大圆旋转结束
→ 调用旧 BeginCheck(SubmittedItems)
→ 旧 BeginCheck 完成骰子和阵营判断
→ 旧 BeginCheck 调用 RevealRandomModuleByTag
→ Reveal 成功
→ 广播 OnLegacyDiceCheckFinished(True)
→ SubmissionPanel 收到成功回调
→ 结算物品
→ 播放淡出
→ 关闭面板并恢复游戏输入
```

失败时：

```text
旧 BeginCheck 失败
→ 广播 OnLegacyDiceCheckFinished(False)
→ 不淡出
→ 解锁三个槽位和中央按钮
→ 玩家可以修改物品后重试
```

## 2. 不再使用 CommitReveal

当前兼容路径中不要再调用：

- `PrepareDiceCheck`；
- `PendingRevealModule`；
- `PendingFactionTag`；
- `PendingRoll`；
- `FindPendingModuleByTag`；
- `CommitReveal`。

否则旧 `BeginCheck` 和新 `CommitReveal` 都可能执行一次 Reveal，产生两个模块或重复结算。

模块选择和 Reveal 只能由旧 `BeginCheck` 负责。

## 3. 在 BP_CoreDevice 创建完成 Dispatcher

在 `BP_CoreDevice` 创建 Event Dispatcher：

`OnDiceCheckFinished`

输入：

- `bSucceeded`：Boolean；
- `FailureReason`：Text，可选。

如果不需要在界面显示错误信息，只保留 `bSucceeded` 也可以。

## 4. 创建统一结束函数

在 `BP_CoreDevice` 创建 Function：

`FinishDiceCheck`

输入：

- `bSucceeded`：Boolean；
- `FailureReason`：Text，可选。

节点顺序：

```text
FinishDiceCheck
→ Set bCheckInProgress = False
→ RefreshSubmissionAvailability
→ Call OnDiceCheckFinished
   bSucceeded = 输入值
   FailureReason = 输入值
```

旧 `Checked` 变量如果只是旧逻辑的临时防重复标记，可以继续保留。不要用它替代本次流程的 `bCheckInProgress`，除非你确认两者所有重置时机完全相同。

## 5. 修改旧 BeginCheck 的成功和失败出口

不要重写旧 `BeginCheck` 的骰子、IDEO 或 Tag 逻辑，只在所有最终出口增加通知。

### Reveal 成功出口

找到旧逻辑中的：

```text
RevealRandomModuleByTag
→ Branch(Reveal Succeeded)
```

True 分支原有逻辑完成后连接：

```text
FinishDiceCheck
  bSucceeded = True
  FailureReason = Empty
```

Archivist、Whalemen、特殊组合等所有成功路径，最终都必须进入一次这个函数。

### Reveal 失败出口

False 分支连接：

```text
FinishDiceCheck
  bSucceeded = False
  FailureReason = "No module available"
```

### 其他提前失败出口

以下情况如果旧 `BeginCheck` 会提前结束，也要分别调用 False：

- SubmittedItems 长度不足；
- ItemData 无效；
- PlayerController 无效；
- Dice Roll 无法执行；
- 没有对应 Tag 的模块；
- Reveal 返回失败。

每条执行路径只能调用一次 `FinishDiceCheck`。

## 6. 同步 Reveal 与异步 Reveal 的区别

如果当前 `RevealRandomModuleByTag` 是同步函数，并且 `Reveal Succeeded` 只有在模块已经显示、碰撞已经启用后才返回 True，可以直接在 True 后广播成功。

如果以后把 Reveal 改成 Timeline、异步动画或延迟生成：

- 不要在调用 Reveal 的同一帧广播成功；
- 应在模块真正生成或 Reveal 动画完成的回调中调用 `FinishLegacyDiceCheck(True)`。

这样才能保证面板是在模块出现后才淡出。

## 7. 在 WBP_SubmissionPanel_V2 绑定完成 Dispatcher

在 `WBP_SubmissionPanel_V2.On Initialized` 中：

```text
Is Valid(CoreDeviceRef)
→ Bind Event to OnLegacyDiceCheckFinished
→ Event = HandleLegacyDiceCheckFinished
```

创建 Custom Event：

`HandleLegacyDiceCheckFinished`

输入与 Dispatcher 完全一致：

- `bSucceeded`；
- `FailureReason`，如果 Dispatcher 有该输入。

不要每次打开面板都重复 Bind。推荐只在 `On Initialized` 绑定一次。

## 8. 处理鉴定失败

`HandleLegacyDiceCheckFinished`：

```text
Branch(bSucceeded)
  False
    → Set bCheckRequestActive = False
    → RefreshSubmissionState
    → Set Button_Slot0 Is Enabled = True
    → Set Button_Slot1 Is Enabled = True
    → Set Button_Slot2 Is Enabled = True
    → 如果 FailureReason 非空，显示错误提示
    → 保持面板 Visible
```

`RefreshSubmissionState` 应根据当前三个槽位决定：

- 仍然填满：`SubmissionState = Ready`，重新启用 `Button_Check`；
- 不完整：`SubmissionState = Selecting`，禁用 `Button_Check`。

失败时不要清空槽位，方便玩家修改后重试。

## 9. 处理鉴定成功

True 分支：

```text
Set bCheckRequestActive = False
→ Set SubmissionState = Resolving / Fading
→ Set Button_Check Is Enabled = False
→ Set Button_Slot0 Is Enabled = False
→ Set Button_Slot1 Is Enabled = False
→ Set Button_Slot2 Is Enabled = False
→ CommitLegacySubmittedItems
→ Play Animation(Anim_PanelFadeOut)
```

如果你的 `E_SubmissionState` 没有 `Resolving` 或 `Fading`，可以继续使用 `Checking`，直到淡出结束再设为 `Closed`。

## 10. 结算物品时允许重复槽位

先确认旧 `BeginCheck` 是否已经删除 Inventory 物品。

### 情况 A：旧 BeginCheck 已经删除物品

不要在 Widget 再删除一次。

`CommitLegacySubmittedItems` 中只做：

```text
ClearSubmissionSlots
→ RefreshSubmissionAvailability
```

### 情况 B：旧 BeginCheck 没有删除物品

在 `BP_CoreDevice` 或 `WBP_SubmissionPanel_V2` 创建：

`CommitLegacySubmittedItems`

如果当前 Inventory 是“不带数量的唯一物品数组”，同一物品即使占三个槽位，也只能从 Inventory 删除一次。

创建本地变量：

- `UniqueConsumedItemIDs`：Name Array。

节点顺序：

```text
Clear UniqueConsumedItemIDs
→ For Each Loop(SubmittedItems)
   → Break S_ItemData
   → ItemID != None
   → Branch
      False → 下一个
      True
        → UniqueConsumedItemIDs Contains ItemID
        → Branch
          True → 下一个
          False → Add ItemID
→ Completed
→ For Each Loop(UniqueConsumedItemIDs)
   → BP_GameInstance.RemoveInventoryItemByID(Array Element)
→ Completed
→ ClearSubmissionSlots
→ CoreDeviceRef.HandleInventoryChanged / RefreshSubmissionAvailability
```

因此：

- `A + A + A`：删除 A 一次；
- `A + A + B`：删除 A 一次、B 一次；
- `A + B + C`：各删除一次。

### 如果以后 Inventory 支持数量或堆叠

若一个 Item ID 有明确 Quantity，并且设计要求三个 A 消耗 3 个数量，则应统计每个 ID 的出现次数，再扣除对应 Quantity。不要使用上面的“唯一 ID 删除一次”版本。

当前从你已有蓝图看，Inventory 使用唯一 ItemData 数组和 `RemoveInventoryItemByID`，因此优先采用“唯一 ID 删除一次”。

## 11. 清空三个槽位

成功结算后调用已有：

`ClearSubmissionSlots`

确保它完成：

```text
Clear / Resize SubmittedItems
→ Set Slot0Filled = False
→ Set Slot1Filled = False
→ Set Slot2Filled = False
→ Image_Item0 Visibility = Hidden 或 Collapsed
→ Image_Item1 Visibility = Hidden 或 Collapsed
→ Image_Item2 Visibility = Hidden 或 Collapsed
→ Set ActiveSlotIndex = -1
```

如果 `SubmittedItems` 必须始终保持长度 3，不要直接 Clear；改为把 0、1、2 写回空的 `S_ItemData`。

## 12. 创建面板淡出动画

在 `WBP_SubmissionPanel_V2` 创建：

`Anim_PanelFadeOut`

推荐时长：`0.4–0.6` 秒，例如 `0.5` 秒。

给面板的整体容器添加 Render Opacity：

```text
0.00 秒 → 1.0
0.50 秒 → 0.0
```

整体容器可以是：

- `ScaleBox_Submission`；或
- 只包含圆形界面的根容器。

如果黑色全屏 Backdrop 也要一起消失，则给 `Canvas_Root` 或整个 Widget 做淡出。

只有成功回调才能播放该动画。旋转动画结束时不能直接播放淡出。

## 13. 淡出结束后关闭面板

创建 Custom Event：

`HandlePanelFadeOutFinished`

连接：

```text
Set SubmissionState = Closed
→ Set Render Opacity = 1.0
   （为下次打开复位）
→ Is Valid(PlayerControllerRef)
→ PlayerControllerRef.CloseSubmissionPanel
```

根据你的 `CloseSubmissionPanel` 实现选择：

### 保留 Widget 实例

```text
Set Visibility = Collapsed
→ SubmissionPanelRef 保留
→ Set Input Mode Game Only
→ bUIInteractionLocked = False
→ 按原游戏规则恢复 Show Mouse Cursor
```

### 每次重新创建 Widget

```text
Remove From Parent
→ PlayerController.SubmissionPanelRef = None
→ Set Input Mode Game Only
→ bUIInteractionLocked = False
→ 恢复鼠标规则
```

如果保留 Widget 实例，下次 `OpenSubmissionPanel` 必须先把整体 Render Opacity 恢复为 `1.0`。

## 14. 区分两个动画结束事件

当前 Widget 至少有：

- `Anim_OuterRingSpin`；
- `Anim_PanelFadeOut`。

分别绑定：

```text
Anim_OuterRingSpin Finished
→ HandleOuterRingSpinFinished

Anim_PanelFadeOut Finished
→ HandlePanelFadeOutFinished
```

不要让一个通用动画结束事件无条件同时调用两个处理函数。

## 15. 教学状态永久保护

成功打开 SubmissionPanel 后，第一次教学状态已经是：

`Completed`

本步骤不得把它重置为：

- `CollectingInitialItems`；
- `WaitingForFirstD`；
- `PointingToLauncher`。

之后第二轮、第三轮只根据：

- Inventory 中是否还有可上缴物品；
- `bCheckInProgress` 是否为 False；
- 当前 UI 是否锁定；

决定能否再次按 D 打开。

## 16. 成功后刷新 Availability

物品结算、槽位清空后调用：

```text
CoreDeviceRef.HandleInventoryChanged
```

或至少调用：

```text
CoreDeviceRef.RefreshSubmissionAvailability
```

这样右上角入口会根据剩余 Inventory 自动变亮或变暗。

不要再次触发首次 D Prompt。

## 17. 测试矩阵

### A + B + C

- 点击 Check；
- 大圆旋转 1.5 秒；
- 旧 DiceCheck 执行一次；
- Reveal 成功后面板淡出；
- 三个物品按现有规则结算。

### A + A + A

- 必须允许进入鉴定；
- 不显示 Duplicate；
- 旧 BeginCheck 收到三个 A；
- 若 Inventory 是唯一数组，只删除 A 一次；
- Reveal 成功后正常淡出。

### 无可用模块

- 旧 BeginCheck 返回失败；
- 面板保持显示；
- 大圆停止；
- 三个槽位恢复可操作；
- 物品不能被删除。

### 连续双击中央按钮

- 只触发一次旋转；
- 只调用一次旧 BeginCheck；
- 只广播一次结束结果。

### 第二轮

- 首轮完成后重新取得物品；
- 按 D 直接打开 SubmissionPanel；
- 不再出现首次教学 Prompt；
- 可再次填槽、旋转、DiceCheck 和 Reveal。

## 18. 最终职责划分

### WBP_SubmissionPanel_V2

- 收集三个槽位数据；
- 允许重复物品；
- 控制中央按钮；
- 播放 1.5 秒旋转；
- 动画结束后调用旧 `BeginCheck`；
- 接收最终成功或失败回调；
- 成功后淡出，失败后解锁。

### BP_CoreDevice 的旧 BeginCheck

- 骰子 Roll；
- IDEO Sum；
- Threshold；
- 特殊组合；
- 阵营 Tag；
- 选择和 Reveal 模块；
- 调用 `FinishLegacyDiceCheck` 返回最终结果。

### BP_GameInstance

- 保存 Inventory；
- 在唯一数组模式下按唯一 Item ID 删除已结算物品；
- 广播 Inventory 变化。

