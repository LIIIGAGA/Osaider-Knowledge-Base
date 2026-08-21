# 第 03 部分：D 键输入与 PlayerController

## 本部分目标

完成：

- D 键 Enhanced Input；
- PlayerController 收到打开请求；
- 第一次与后续打开行为分流；
- 保证 Submission Widget 只有一个实例；
- 正确管理鼠标、输入模式和世界交互锁定。

## 1. 创建 Input Action

在 Content Browser 中：

1. 右键 → Input → Input Action。
2. 命名：`IA_OpenSubmission`。
3. 打开它。
4. `Value Type` 选择 Digital / Bool。
5. Save。

## 2. 添加 D 键映射

打开当前游戏使用的 Input Mapping Context，例如 `IMC_Gameplay`。

1. Add Mapping。
2. Input Action 选择 `IA_OpenSubmission`。
3. Key 选择 D。
4. 不需要 Modifier。
5. Save。

如果项目没有 Enhanced Input，而是旧 Input 系统：

- 可以临时在 Project Settings → Input 中增加 Action Mapping；
- 但 UE 5.6 项目更建议使用 Enhanced Input；
- 不要同时建立两套 D 输入，避免触发两次。

## 3. 确认 Mapping Context 已加入

在 `BP_NoCharacterPlayerController.BeginPlay` 检查现有流程是否已经：

```text
Get Enhanced Input Local Player Subsystem
→ Add Mapping Context(IMC_Gameplay, Priority)
```

如果现有其他输入都能工作，通常这里已经完成，不要重复 Add。

## 4. 在 PlayerController 新增变量

### `CoreDeviceRef`

- 类型：`BP_CoreDevice` Object Reference。
- 如果已有则复用。

### `SubmissionPanelRef`

- 类型：`WBP_SubmissionPanel` Object Reference。
- 默认 None。

### `HUDRef`

- 类型：你当前常驻 HUD Widget 的 Object Reference。
- 用于第一次引导右上角图标。

### `bUIInteractionLocked`

- Boolean，默认 False。

### `bSubmissionLauncherHintActive`

- Boolean，默认 False。

不要在 PlayerController 新建或继续使用 `bFirstSubmissionTutorialComplete`。首次教学的唯一状态来自：

```text
CoreDeviceRef.SubmissionTutorialState
```

## 5. 创建 `HandleOpenSubmissionInput`

新建 Function 或 Custom Event：

`HandleOpenSubmissionInput`

节点顺序：

```text
Is Valid(CoreDeviceRef)
→ Branch
  False → Return / Print Error
  True
    → Branch(bUIInteractionLocked)
      True → Return
      False
        → CoreDeviceRef.CanOpenSubmission
        → Branch
          False → 可选播放不可用提示，然后 Return
          True
            → Switch on E_SubmissionTutorialState

              CollectingInitialItems
              → Return（条件理论上尚未解锁）

              WaitingForFirstD
              → CoreDeviceRef.SetSubmissionTutorialState(PointingToLauncher)
              → GuidePlayerToSubmissionLauncher

              PointingToLauncher
              → GuidePlayerToSubmissionLauncher
                 （只刷新/保持已有提示，不创建第二份教学 UI）

              Completed
              → OpenSubmissionPanel
```

状态转换必须发生在 CoreDevice，不要在 Controller 中直接 Set 枚举变量。

## 6. 连接 Enhanced Input Event

在 PlayerController Event Graph 中添加：

`IA_OpenSubmission`

使用 `Started` 引脚，不建议使用 `Triggered`，否则按住 D 时可能每帧触发。

连接：

```text
IA_OpenSubmission Started
→ HandleOpenSubmissionInput
```

## 7. 创建 `OpenSubmissionPanel`

新建 Function 或 Custom Event：

`OpenSubmissionPanel`

输出：

- `Success`：Boolean，默认 False。

节点顺序：

```text
Is Valid(SubmissionPanelRef)
→ Branch
  True
    → Set Visibility Visible
    → Set Keyboard Focus / Set User Focus
    → EnterSubmissionUIMode（如果当前尚未进入 UI Mode）
    → Set Success = True
    → Return
  False
    → Create Widget(WBP_SubmissionPanel, Owning Player = Self)
    → Set SubmissionPanelRef
    → 给 Widget 设置 CoreDeviceRef 和 PlayerControllerRef
    → Add to Viewport（ZOrder 高于普通 HUD）
    → SubmissionPanelRef.InitializeSubmissionPanel
    → EnterSubmissionUIMode
    → Set Success = True
```

Create Widget 返回无效、初始化失败或无法显示时保持 `Success=False`。

第一次通过红色入口成功打开时，由第 04 部分调用 `OpenSubmissionPanel` 并检查成功输出，然后调用：

```text
CoreDeviceRef.SetSubmissionTutorialState(Completed)
```

`OpenSubmissionPanel` 本身只负责创建/显示面板，并返回 `Success`；它不直接修改教学状态。

## 8. 创建 `EnterSubmissionUIMode`

节点顺序：

```text
Set bUIInteractionLocked = True
→ Set Input Mode Game and UI
   In Widget to Focus = SubmissionPanelRef
   Mouse Lock Mode = Do Not Lock 或按当前项目需要
→ Set Show Mouse Cursor = True
→ Set User Focus(SubmissionPanelRef)
```

然后找到 PlayerController 中负责世界交互的入口，在这些逻辑之前增加：

```text
Branch(bUIInteractionLocked)
True → 不执行世界逻辑
False → 继续旧逻辑
```

需要保护的旧逻辑包括：

- HoverTrace；
- LMB 点击 Actor；
- StartDrag / UpdateDrag / EndDrag；
- RMB 相机移动；
- 其他会与 UI 冲突的世界输入。

## 9. 创建 `CloseSubmissionPanel`

输入可选：

- `bRemoveWidget` Boolean。

节点顺序：

```text
Is Valid(SubmissionPanelRef)
→ 如果需要 Remove From Parent
→ Set SubmissionPanelRef = None（只在 Remove 时）
→ Set Input Mode Game Only
→ Set bUIInteractionLocked = False
→ 根据现有游戏规则设置 Show Mouse Cursor
```

注意：鉴定和淡出期间不要允许玩家手动调用 Close。

## 10. 暂时创建测试打开

在 `OpenSubmissionPanel` 尚未完成 Widget 前，可以临时连接：

```text
OpenSubmissionPanel
→ Print String "OPEN SUBMISSION REQUESTED"
```

先确认 D 输入与条件分流正确，再接真正 Widget。

## 11. 移除旧 Enter 入口的方法

暂时不要删除整段旧逻辑。

1. 找到 Enter Input Event。
2. 断开它到 `BeginCheck` 的执行线。
3. 给旧节点加 Comment：

   `LEGACY — replaced by central Check button`

4. 测试 V2 全流程通过后再清理。

## 12. 本部分测试

### 条件未满足

- 按 D 不打开面板。
- 不应产生报错。

### 条件满足但第一次教学未完成

- State 为 `WaitingForFirstD` 时，按 D 转为 `PointingToLauncher` 并调用引导事件，不直接创建 Widget。
- State 已是 `PointingToLauncher` 时，再按 D 只保持同一个提示，不重复创建教学 Widget。

### 教学完成

- State 为 `Completed` 时，按 D 创建一个 Widget。
- 再按 D 不创建第二个 Widget。

### UI 打开

- 鼠标可用。
- 点击 UI 不触发场景 Actor。
- RMB 不移动相机。

### UI 关闭

- 游戏输入恢复。
- 世界点击和相机恢复。

## 13. 常见错误

### 按一次 D 打开两个 Widget

- 确认使用 `Started` 而非每帧 `Triggered`；
- 确认没有旧 Input Action 同时绑定 D；
- 创建前检查 `Is Valid(SubmissionPanelRef)`。

### UI 打开后仍能点击场景

- `Set Input Mode Game and UI` 不会自动阻止你的自定义 HoverTrace；
- 必须用 `bUIInteractionLocked` 在旧世界交互逻辑前 Branch。

### 第二轮又播放首次教学

- 检查是否仍在读取 PlayerController 的旧 Boolean；
- 删除旧分支，改为 Switch `CoreDeviceRef.SubmissionTutorialState`；
- 检查 Commit/Reset 是否误把状态改回 `CollectingInitialItems`。

### 关闭后不能操作游戏

- 检查是否恢复 `Game Only`；
- 检查 `bUIInteractionLocked` 是否设回 False；
- 检查鼠标显示状态是否符合项目原规则。

## 14. 本部分验收

- [ ] D 使用 Enhanced Input Started。
- [ ] 未解锁时 D 不打开。
- [ ] D 键只依据 CoreDevice 的四状态枚举分流。
- [ ] Waiting 状态转为 Pointing，Completed 状态才直接打开。
- [ ] 不存在独立的 PlayerController 教学完成 Boolean。
- [ ] Widget 保持单实例。
- [ ] UI 打开时世界交互被锁定。
- [ ] UI 关闭后全部输入恢复。
- [ ] Enter 已断开但旧节点仍可恢复。
