# 第 06 部分：Start 按钮、淡出与进入游戏

## 本部分目标

让 Start 只响应一次，完成视觉淡出和媒体关闭，然后由 `BP_IntroPlayerController` 打开 `Prototype_07`。Widget 负责表现，PlayerController 负责全局导航。

## 1. 创建 Event Dispatcher

在 `WBP_GameIntro` 中创建 Event Dispatcher：

```text
OnIntroFinished
```

不需要输入参数。

职责：

```text
WBP_GameIntro
负责按钮、动画和关闭媒体

BP_IntroPlayerController
负责接收完成通知并打开 Gameplay Level
```

这样 Widget 不需要硬编码关卡名称。

## 2. Start.OnClicked

选择 `BTN_Start`，添加 OnClicked：

```text
BTN_Start.OnClicked
→ DoOnce
→ IntroPCRef.SetIntroCursorState(Normal)
→ Set Is Enabled
    Target = BTN_Start
    Is Enabled = false
→ Set TXT_LoadState Text = "ENTRY AUTHORIZED"
→ Play Animation
    Animation = ANIM_IntroExit
    Num Loops to Play = 1
    Play Mode = Forward
```

`DoOnce` 是必要保护。即使按钮的 Enabled 状态更新慢一帧，也不会重复执行切关流程。

## 3. 动画完成后的处理

为 `ANIM_IntroExit` 添加 Animation Finished 事件，或使用 Bind to Animation Finished。

流程：

```text
On Animation Finished (ANIM_IntroExit)
→ Branch
    Animation == ANIM_IntroExit
→ Close
    Target = IntroMediaPlayer
→ Call OnIntroFinished
```

不要在按钮刚点击时立刻 Open Level，否则退出动画不会显示。

不要使用固定 2–3 秒 Delay。切关反馈应保持短促，建议淡出总时长 0.35–0.6 秒。

## 4. PlayerController 绑定 Dispatcher

回到 `BP_IntroPlayerController`。

在 BeginPlay 的 Create Widget 之后、Add to Viewport 之前加入：

```text
Create Widget
→ Set IntroWidgetRef
→ Bind Event to OnIntroFinished
    Target = IntroWidgetRef
    Event = HandleIntroFinished
→ Add to Viewport
```

创建 Custom Event：

```text
HandleIntroFinished
```

执行：

```text
HandleIntroFinished
→ Is Valid(MouseCursorRef)
→ Remove from Parent
    Target = MouseCursorRef
→ Open Level (by Name)
    Level Name = GameplayLevelName
    Absolute = true
```

`GameplayLevelName` 默认值：

```text
Prototype_07
```

这里只移除 Intro Controller 创建的那一个鼠标实例。进入 Gameplay 后，`BP_NoCharacterPlayerController` 会按原项目流程重新创建 `WBP_MouseCursor`。不要把 `MouseCursorRef` 保存到 Game Instance，也不要让 Intro 鼠标跨关卡存活。

如果项目使用 Soft Object Reference 方式管理地图，可以改为 `Open Level by Object Reference`，减少拼写错误。

## 5. 切关时不手动创建 Gameplay PlayerController

不要在 Intro 中：

- Spawn `BP_NoCharacterPlayerController`；
- 手动 Possess Gameplay Pawn；
- 复制 HoverTrace 逻辑；
- 把 Input Mode 改成 Gameplay 后继续留在 `L_Intro`。

`Open Level` 会加载 `Prototype_07`。该关卡自己的 GameMode 会创建正确的 Gameplay PlayerController。

## 6. 可选：切关前音频淡出

如果使用 `BP_IntroMediaAudio`：

```text
Start Clicked
→ 调用 Audio Fade Out，时长 0.4 秒
→ 同时播放 ANIM_IntroExit
→ Animation Finished
→ Close MP_Intro
→ OnIntroFinished
```

视觉和音频淡出时间应基本一致。

## 7. 可选：Start 解锁条件

默认建议 Start 立即可用，不必等待视频加载。

如果确实需要等页面初始化完成：

- Widget 创建后 Start 可见；
- 视频加载不超过 0.5 秒时正常启用；
- 超时或失败时自动启用；
- 不允许玩家因为媒体文件错误永远卡在 Intro。

## 8. 进入游戏后的回归检查

点击 Start 并进入 `Prototype_07` 后检查：

- `BP_NoCharacterPlayerController` 是否生效；
- 鼠标是否可见；
- HoverTrace 是否能检测 Interaction Point；
- LMB 是否能点击和拖动；
- RMB 是否能移动模块相机；
- Space 是否能旋转全局结构；
- Intro 视频声音是否已经停止。

如果鼠标模式异常，应检查 Gameplay PlayerController 的 BeginPlay 初始化，而不是让 Intro PlayerController跨关卡修复。

## 9. 本部分验收

- [ ] Widget 已创建 `OnIntroFinished` Dispatcher。
- [ ] Start OnClicked 经过 `DoOnce`。
- [ ] 点击后按钮立即 Disable。
- [ ] 淡出动画完整播放。
- [ ] 动画完成后 Close Media Player。
- [ ] `BP_IntroPlayerController` 已绑定 Dispatcher。
- [ ] `HandleIntroFinished` 打开 `Prototype_07`。
- [ ] 快速连续点击不会打开两次关卡。
- [ ] Intro 创建的 `WBP_MouseCursor` 在切关前已移除。
- [ ] 进入游戏后现有鼠标与相机输入正常。

## 常见错误

### 点击 Start 没反应

先在 Button OnClicked、Animation Finished 和 HandleIntroFinished 三处分别加 Print String，确认中断发生在哪一段。

### 淡出动画没有播放就切关

Open Level 放得太早。它必须位于 `ANIM_IntroExit` 的完成事件之后。

### 点击一次却触发两次切关

检查是否同时在 Widget 和 PlayerController 中调用了 Open Level，并确认 Button 流程前有 `DoOnce`。

### 进入游戏后鼠标不工作

确认 `Prototype_07` 使用原来的 Gameplay GameMode 和 `BP_NoCharacterPlayerController`，不要把项目全局 PlayerController 改成 Intro Controller。
