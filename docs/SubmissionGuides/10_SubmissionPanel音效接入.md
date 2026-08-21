# 10. SubmissionPanel 音效接入

本节在已经稳定运行的 `WBP_SubmissionPanel_V2`、旧 `BeginCheck` 和模块 Reveal 链路上增加音效。

本节不修改：

- 物品写入与槽位状态；
- `SubmissionState` 状态切换；
- 旧 DiceCheck 的分数与 Reveal 逻辑；
- `UIInteractionLocked`、面板关闭与再次打开逻辑。

音效只连接到已经确认会执行的事件节点，避免重新引入交互问题。

---

## 1. 建议准备的音效

至少准备以下音效资源：

| 变量名 | 用途 | 建议时长 |
|---|---|---:|
| `SFX_PanelOpen` | SubmissionPanel 出现 | 0.2–0.6 秒 |
| `SFX_SlotClick` | 点击三个圆形槽位 | 0.05–0.2 秒 |
| `SFX_ItemAssigned` | 物品成功进入槽位 | 0.1–0.35 秒 |
| `SFX_CheckPressed` | 点击中央 Check 按钮 | 0.1–0.35 秒 |
| `SFX_CheckInvalid` | 条件不足或点击失败 | 0.1–0.4 秒 |
| `SFX_SpinLoop` | 外圈旋转过程 | 循环，或正好 1.5 秒 |
| `SFX_CheckSuccess` | 模块成功生成 | 0.4–1.2 秒 |
| `SFX_CheckFailure` | 没有可用模块或鉴定失败 | 0.3–0.8 秒 |
| `SFX_PanelClose` | 面板开始淡出 | 0.2–0.6 秒 |

推荐风格：短促机械点击、继电器、纸张摩擦、齿轮转动、低频仪式感冲击。不要让每个点击音都很响；`CheckSuccess` 和模块 Reveal 才是主要反馈。

导入 UE 后，双击 Sound Wave 检查：

- Compression 正常；
- UI 音效不需要空间衰减；
- `SFX_SpinLoop` 如果是循环素材，启用 Looping，或用 Sound Cue 设置 Looping；
- 音量先保持较低，后面统一调整。

---

## 2. 在 `WBP_SubmissionPanel_V2` 创建变量

在 `WBP_SubmissionPanel_V2` 中创建以下变量，类型全部为：

`Sound Base Object Reference`

```text
SFX_PanelOpen
SFX_SlotClick
SFX_ItemAssigned
SFX_CheckPressed
SFX_CheckInvalid
SFX_SpinLoop
SFX_CheckSuccess
SFX_CheckFailure
SFX_PanelClose
```

再创建：

```text
SpinAudioComponentRef
```

类型：`Audio Component Object Reference`。

编译后，在 Class Defaults 中给每个 Sound Base 变量指定对应音效。

如果某个音效暂时没有素材，可以保持 None；播放前可加 `Is Valid`，也可以直接等素材完成后再连接。

---

## 3. 面板打开音效

不要把打开音效放在 `Construct` 或 `On Initialized` 中，因为当前面板会被重复复用；这两个事件通常只在 Widget 创建时执行一次。

在 `InitializeSubmissionPanel` 中，恢复面板可见性与透明度之后连接：

```text
Canvas_Root Set Visibility(Visible)
→ Canvas_Root Set Render Opacity(1.0)
→ Play Sound 2D(SFX_PanelOpen)
→ 继续原来的 RefreshSlotVisuals / RefreshSubmissionState
```

这样每次按 D 或点击右上角入口真正打开面板时，都会播放一次。

### 打开前清理残留旋转音

为了防止上一轮异常退出后循环音还在播放，在 `InitializeSubmissionPanel` 前部增加：

```text
Is Valid(SpinAudioComponentRef)
  True
    → Stop
    → Set SpinAudioComponentRef = None
  False
    → 继续
```

然后再恢复 `Canvas_Root`。

---

## 4. 三个槽位按钮音效

在三个按钮的 `OnClicked` 中，在 `OpenInventoryForSlot` 之前播放：

```text
Button_Slot0 OnClicked
→ Play Sound 2D(SFX_SlotClick)
→ OpenInventoryForSlot(0)
```

```text
Button_Slot1 OnClicked
→ Play Sound 2D(SFX_SlotClick)
→ OpenInventoryForSlot(1)
```

```text
Button_Slot2 OnClicked
→ Play Sound 2D(SFX_SlotClick)
→ OpenInventoryForSlot(2)
```

保留现在已经正常工作的 `OpenInventoryForSlot`、Inventory ZOrder、Backdrop 可见性和绑定逻辑，不在这里重构。

---

## 5. 物品成功填入槽位的音效

在 `OnSubmissionItemChosen(ChosenItem)` 中，找到：

```text
AssignItemToSlot
→ Branch(Success)
```

True 分支改为：

```text
True
→ Play Sound 2D(SFX_ItemAssigned)
→ InventoryPanelRef Set Visibility(Collapsed)
→ 恢复 Button_BackdropBlocker
→ ActiveSlotIndex = -1
→ Set User Focus 到 SubmissionPanel
```

False 分支可连接：

```text
False
→ Play Sound 2D(SFX_CheckInvalid)
→ 保持 Inventory 打开
```

不要在 `UpdateSlotVisual` 中播放音效，因为 `RefreshSlotVisuals` 重新打开面板时也会调用它，容易连续播放三次。

---

## 6. 中央 Check 按钮按下音效

在 `Button_Check OnClicked` 的现有验证链中，只有在以下条件全部通过后播放：

- `SubmissionState == Ready`；
- `CoreDeviceRef` 有效；
- `bCheckRequestActive == False`；
- `CoreDeviceRef.bCheckInProgress == False`；
- `ValidateSubmittedItems` 返回 True。

在设置检查状态之前连接：

```text
ValidateSubmittedItems
→ Branch(IsValidSubmission)
  True
    → Play Sound 2D(SFX_CheckPressed)
    → Set bCheckRequestActive = True
    → Set CoreDeviceRef.bCheckInProgress = True
    → Set SubmissionState = Checking
    → 禁用 Button_Check 与三个 Slot
    → 启动旋转音
    → Play Animation(Anim_OuterRingSpin)
```

验证失败的 False 分支：

```text
False
→ Play Sound 2D(SFX_CheckInvalid)
→ 保持现有失败处理
```

不要在 `OnClicked` 最前面直接播放 `SFX_CheckPressed`，否则禁用状态或无效点击也会听起来像成功启动了鉴定。

---

## 7. 外圈 1.5 秒旋转音

### 方案 A：循环音效，推荐

在播放 `Anim_OuterRingSpin` 之前：

```text
Spawn Sound 2D
  Sound = SFX_SpinLoop
  Auto Destroy = False
→ Set SpinAudioComponentRef = Return Value
→ Play Animation(Anim_OuterRingSpin)
```

如果节点没有显示 `Auto Destroy`，展开节点的 Advanced Pins。

`SFX_SpinLoop` 的 Sound Wave 或 Sound Cue 要启用循环。

在 `HandleOuterRingSpinFinished` 的最前面：

```text
Is Valid(SpinAudioComponentRef)
  True
    → Fade Out
        Fade Out Duration = 0.12
        Fade Volume Level = 0.0
    → Set SpinAudioComponentRef = None
  False
    → 继续

→ 调用旧 BeginCheck
```

这样旋转动画真正结束时，循环音才停止，然后才进入旧 DiceCheck。

### 方案 B：使用正好 1.5 秒的一次性音效

如果素材本身正好 1.5 秒，可以直接：

```text
Play Sound 2D(SFX_SpinLoop)
→ Play Animation(Anim_OuterRingSpin)
```

该方案不需要 `SpinAudioComponentRef`，但素材长度必须与动画严格一致。

不要用一个独立的 `Delay(1.5)` 停止循环音；现在已经有准确的 Animation Finished 回调，直接使用它更稳定。

---

## 8. 鉴定结果音效

在已经绑定到 `CoreDevice.OnDiceCheckFinished` 的：

`HandleDiceCheckFinished(Succeeded, FailureReason)`

中处理。

### 成功

```text
Branch(Succeeded)
  True
    → Play Sound 2D(SFX_CheckSuccess)
    → Set bCheckRequestActive = False
    → Set SubmissionState = FadingOut / Checking
    → 禁用所有按钮
    → CommitSubmittedItems（如果当前保留该函数）
    → Play Sound 2D(SFX_PanelClose)
    → Play Animation(Anim_PanelFadeOut)
```

### 失败

```text
False
→ Play Sound 2D(SFX_CheckFailure)
→ Set bCheckRequestActive = False
→ RefreshSubmissionState
→ 恢复三个 Slot 按钮
→ 根据当前槽位状态恢复 Button_Check
→ 保持面板 Visible
```

结果音只在这里播放一次。不要同时在 `BeginCheck`、`FinishDiceCheck` 和 Widget 回调里各播放一次。

---

## 9. 面板淡出与关闭音效

`SFX_PanelClose` 应放在：

```text
Play Animation(Anim_PanelFadeOut)
```

之前，而不是 `HandlePanelFadeOutFinished` 中。

原因：玩家应该在面板开始消失时听到关闭反馈，而不是完全消失后才听见。

`HandlePanelFadeOutFinished` 只做安全清理：

```text
Is Valid(SpinAudioComponentRef)
  True → Stop → Set None

→ 原有关闭面板链路
→ CloseSubmissionPanel
→ ExitSubmissionUIMode
```

不要改变目前已经修好的 `UIInteractionLocked = False` 和再次打开面板逻辑。

---

## 10. 可选：模块 Reveal 的 3D 音效

UI 结果音表达“鉴定完成”，模块 Reveal 音表达“世界中有东西生成”。两者可以同时存在，但应当使用不同层次的声音。

在 `BP_CoreDevice` 的旧 Reveal 成功出口，也就是已经确认模块真正 Reveal 成功之后连接：

```text
Reveal Succeeded
→ Is Valid(SuccessfullyRevealedModule)
→ Get Actor Location
→ Spawn Sound at Location(SFX_ModuleReveal)
→ FinishDiceCheck(True)
```

需要在 `BP_CoreDevice` 创建：

```text
SFX_ModuleReveal
```

类型：`Sound Base Object Reference`。

不要在尝试 Reveal 之前播放，否则找不到可用模块时也会听到生成音。

---

## 11. 可选：右上角入口音效

在 `WBP_MainHUD` 的：

```text
Button_SubmissionLauncher OnClicked
```

中，可在确认 `CanOpenSubmission == True` 后播放入口点击音。

可以复用 `SFX_CheckPressed`，也可以建立独立的：

```text
SFX_LauncherClick
```

不要在 `CanOpenSubmission == False` 时播放成功音；无效时使用较轻的 `SFX_CheckInvalid`。

---

## 12. 防止重复播放

重点检查：

1. `SFX_PanelOpen` 只在 `InitializeSubmissionPanel` 播放；
2. `SFX_ItemAssigned` 只在 `AssignItemToSlot Success` 后播放；
3. `SFX_CheckPressed` 只在 Validate 成功后播放；
4. `SFX_SpinLoop` 每次启动前先检查旧 Audio Component；
5. `SFX_CheckSuccess/Failure` 只在 `HandleDiceCheckFinished` 播放；
6. `SFX_PanelClose` 只在开始 FadeOut 时播放；
7. 不在 Tick、Pre Construct、RefreshSlotVisuals 中播放音效。

如果同一个结果音播放两次，优先检查 `OnDiceCheckFinished` 是否被重复 Bind。当前已有 `bDiceCheckDispatcherBound`，应继续保留该保护。

---

## 13. 建议测试顺序

先只接入一个音效并逐步验证：

1. 面板打开音；
2. 点击 Slot 音；
3. 物品填入音；
4. Check 按下音；
5. 旋转循环音与停止；
6. 成功/失败结果音；
7. 淡出关闭音；
8. 世界模块 Reveal 音。

每完成一项就测试一轮，避免多个音效同时接入后难以判断重复播放或未触发的位置。

完整测试应确认：

- 第一次打开有一次打开音；
- 切换三个 Slot 不会产生重复 Widget 音效；
- 物品成功填入才播放确认音；
- 三个槽位未填满时点击 Check 不播放成功启动音；
- 旋转音随 1.5 秒动画结束而停止；
- 模块生成后播放成功音并开始淡出；
- 第二轮再次打开时没有残留循环音；
- 第二轮所有音效仍只播放一次。

