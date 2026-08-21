# 第 04 部分：首次 Prompt、右上角红色入口与教学完成

## 本部分目标

首次流程：

```text
三个指定初始模块成功发放物品
→ CoreDevice State = WaitingForFirstD
→ HUD 显示按 D
→ 玩家第一次按 D
→ State = PointingToLauncher
→ HUD 强调右上角红色图标
→ 玩家点击图标
→ State = Completed
→ 打开中央 Submission 面板
```

后续流程：

```text
CoreDevice State 始终保持 Completed
→ 有三件有效物品时按 D
→ 直接打开 Submission
```

教学 UI 只能由 `SubmissionTutorialState` 驱动，不能通过 Widget 自己记忆。

## 1. 找到常驻 HUD

确认右上角红色图标属于哪个常驻 Widget。

如果它还不是 Button：

1. 在原图标位置添加 Button。
2. 命名 `Button_SubmissionLauncher`。
3. Button 的 Normal/Hovered/Pressed 背景保持透明。
4. 把红色图标 Image 放在 Button 内。

建议引用：

- `Image_SubmissionLauncherIcon`
- `Text_SubmissionLauncherHint`
- `PromptWidgetRef`
- `PlayerControllerRef`
- `CoreDeviceRef`

## 2. HUD 初始可见状态

- State = `CollectingInitialItems`：红色图标隐藏或低亮，D Prompt 隐藏。
- State = `WaitingForFirstD`：图标正常可见，显示 D Prompt。
- State = `PointingToLauncher`：隐藏 D Prompt，播放红色图标 Attention。
- State = `Completed`：不显示任何教学文字或 Attention；图标仍可作为普通鼠标入口。

## 3. 绑定两个 Dispatcher

HUD 初始化：

```text
Get Player Controller
→ Cast BP_NoCharacterPlayerController
→ Set PlayerControllerRef
→ Get CoreDeviceRef
→ Bind OnSubmissionAvailabilityChanged
→ Bind OnSubmissionTutorialStateChanged
→ 主动调用 RefreshSubmissionHUD
```

必须主动刷新一次，因为 CoreDevice 可能在 HUD 绑定之前已经改变状态。

## 4. 创建 `RefreshSubmissionHUD`

该函数同时读取：

- `CoreDeviceRef.bSubmissionAvailable`
- `CoreDeviceRef.SubmissionTutorialState`

推荐节点：

```text
Switch on E_SubmissionTutorialState

CollectingInitialItems
→ Hide D Prompt
→ Hide Launcher Hint
→ Launcher Disabled 或低亮

WaitingForFirstD
→ Branch(bSubmissionAvailable)
  True
    → Launcher Enabled
    → Show D Prompt
    → Hide Launcher Attention
  False
    → Hide D Prompt

PointingToLauncher
→ Hide D Prompt
→ Branch(bSubmissionAvailable)
  True
    → Launcher Enabled
    → Show Launcher Attention
  False
    → Hide Launcher Attention（状态保留，等物品再次可用）

Completed
→ Hide D Prompt
→ Hide Launcher Attention
→ Launcher Enabled = bSubmissionAvailable
→ 根据 Availability 设置正常或低亮外观
```

重要：`Completed` 分支绝不能显示 D 教学 Prompt。后续物品变为可用时，也只让入口变亮。

## 5. Dispatcher 回调

创建：

```text
HandleSubmissionAvailabilityChanged(bIsAvailable)
→ RefreshSubmissionHUD
```

以及：

```text
HandleSubmissionTutorialStateChanged(NewState)
→ RefreshSubmissionHUD
```

这样 HUD 只显示状态，不自行决定状态变化。

## 6. 复用 `WBP_InputPrompt`

State = `WaitingForFirstD` 且 Available = True 时：

```text
ShowPrompt
Key = D
Message = OPEN SUBMISSION
```

以下情况隐藏：

- 玩家按 D，State 转为 `PointingToLauncher`；
- State 为 `Completed`；
- Submission 暂时不可用；
- 正在鉴定。

如果 Prompt Widget 已经存在，更新它，不要每次状态刷新都 Create 一个新的。

## 7. `GuidePlayerToSubmissionLauncher`

这个事件由 PlayerController 在 `WaitingForFirstD` 或 `PointingToLauncher` 状态按 D 时调用：

```text
Is Valid(HUDRef)
→ HUDRef.ShowSubmissionLauncherAttention
→ Set bSubmissionLauncherHintActive = True
```

它只操作同一个 HUD 元素，不创建新的教学 Widget。

## 8. 制作红色图标提示动画

HUD Animation：`Anim_LauncherAttention`。

建议 0.85 秒：

### Scale

```text
0.00 → 1.00
0.18 → 1.12
0.40 → 1.00
0.62 → 1.08
0.85 → 1.00
```

### Opacity

```text
0.00 → 0.65
0.18 → 1.00
0.40 → 0.75
0.62 → 1.00
0.85 → 1.00
```

可以循环 2–3 次，但不要无限快速闪烁。

## 9. 图标旁提示文字

添加 `Text_SubmissionLauncherHint`：

`CLICK TO START CHECK`

初始 Visibility = Collapsed。

```text
ShowSubmissionLauncherAttention
→ 如果动画未播放，则 Play Anim_LauncherAttention
→ Text Visibility = Hit Test Invisible
```

```text
HideSubmissionLauncherHint
→ Stop Animation
→ Text Visibility = Collapsed
→ bSubmissionLauncherHintActive = False
```

## 10. 连接右上角图标点击

`Button_SubmissionLauncher.OnClicked`：

```text
Is Valid(CoreDeviceRef) AND Is Valid(PlayerControllerRef)
→ CoreDeviceRef.CanOpenSubmission
→ Branch

False
→ 可选无效反馈

True
→ Switch on CoreDeviceRef.SubmissionTutorialState

  CollectingInitialItems
  → Return

  WaitingForFirstD
  → 不建议正常到达；可转 Pointing 并只显示提示，暂不打开

  PointingToLauncher
  → PlayerControllerRef.OpenSubmissionPanel
  → Branch(Open Success)
    False → 保持 PointingToLauncher，允许玩家重试
    True
      → CoreDeviceRef.SetSubmissionTutorialState(Completed)
      → HideSubmissionLauncherHint
      → Hide WBP_InputPrompt

  Completed
  → PlayerControllerRef.OpenSubmissionPanel
```

建议给 `OpenSubmissionPanel` 增加 `Success` 输出：已有有效 Widget 并成功显示，或新 Widget 成功创建并加入 Viewport 时返回 True。只有 True 才把状态设为 `Completed`；创建失败则保持 `PointingToLauncher`，不会把教学卡在错误的完成状态。

## 11. 为什么不会再次触发教学

首次点击图标后，全局状态为 `Completed`：

1. 模块侧只有三个初始实例 `bCountsTowardInitialUnlock=True`。
2. 同一个初始实例有 `bHasReportedInitialTrigger=True`。
3. CoreDevice 的 `NotifyInitialModuleTriggered` 只接受 `CollectingInitialItems`。
4. HUD 的 `Completed` 分支永远隐藏所有教学 Prompt。
5. PlayerController 的 `Completed` 分支直接打开面板。

所以后续模块 Reveal、交互、获得物品、第二轮或更多轮循环，只会刷新 Submission 是否可用，不会改变教学状态。

## 12. 状态存放范围

- 新开一局应该重新教学：状态保存在本局 `BP_CoreDevice`。
- 同一局跨关卡不重播：将状态同步到 `GameInstance`。
- 退出游戏重进也不重播：写入 `SaveGame`。

当前需求是“第一次进入游戏触发、后续循环不触发”，所以先使用 CoreDevice；不要把状态放在临时 Widget。

## 13. 测试

### 首次流程

1. State = Collecting：无教学 UI。
2. 三初始物品齐全：State = Waiting，D Prompt 出现。
3. 按 D：State = Pointing，D Prompt 消失，红图标高亮。
4. 再按 D：只保持同一个高亮，不创建第二份提示。
5. 点击图标：面板成功打开后，State = Completed。

### 第二轮

1. Reveal 新模块并取得物品。
2. 检查 State 仍是 Completed。
3. 教学 Prompt 和 Attention 都不出现。
4. 条件满足后按 D，面板直接打开。

### 强制错误调用

1. State = Completed。
2. 调试强制调用 `NotifyInitialModuleTriggered`。
3. HUD 不应出现任何教学 UI。

## 14. 常见错误

### 第二轮 D Prompt 又出现

- HUD 只监听 Availability，却没有检查 Tutorial State；
- 修正 `RefreshSubmissionHUD`，Completed 分支只更新普通入口，不显示 Prompt。

### 每按一次 D 创建一个提示 Widget

- `GuidePlayerToSubmissionLauncher` 内不应 Create Widget；
- 只播放常驻 HUD 上的同一个动画和文字。

### 点击图标后仍处于 Pointing

- 点击成功分支漏掉 `SetSubmissionTutorialState(Completed)`；
- 或错误地直接 Set 了 Controller 本地变量。

## 15. 本部分验收

- [ ] HUD 同时读取 Availability 和 Tutorial State。
- [ ] Waiting 才显示 D Prompt。
- [ ] Pointing 才播放首次图标 Attention。
- [ ] Completed 不显示任何教学 UI。
- [ ] 首次面板成功打开后 CoreDevice 状态变为 Completed。
- [ ] 后续点击图标或按 D 都直接打开。
- [ ] 后续模块和多轮循环无法重新触发教学。
