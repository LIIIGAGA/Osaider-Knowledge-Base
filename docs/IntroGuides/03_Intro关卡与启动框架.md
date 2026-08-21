# 第 03 部分：Intro 关卡、GameMode 与 PlayerController

## 本部分目标

创建独立的 `L_Intro`、`GM_Intro` 和 `BP_IntroPlayerController`。运行 Intro 关卡时，由 Intro PlayerController 创建 `WBP_GameIntro`，并复用项目现有的自定义鼠标。

本部分暂时可以使用一个简单的测试 Widget；第 04 部分再完成正式界面。

## 1. 创建 Intro 关卡

在：

```text
Content/Osaider/Intro/Maps
```

创建一个 Empty Level，保存为：

```text
L_Intro
```

这个关卡不需要：

- 游戏模块；
- Gameplay Camera；
- Interaction Point；
- Ocean；
- Dice Check；
- 默认 Pawn。

它只负责承载 Intro UI 和可选的视频声音 Actor。

如果使用视频声音，把 `BP_IntroMediaAudio` 拖入关卡。

## 2. 创建 BP_IntroPlayerController

在：

```text
Content/Osaider/Intro/Blueprints
```

创建 Player Controller Blueprint：

```text
BP_IntroPlayerController
```

本项目已经存在以下鼠标资源，直接复用：

```text
/Game/TopDown/Blueprints/WidgetBlueprint/WBP_MouseCursor
/Game/TopDown/Blueprints/WidgetBlueprint/WBP_InvisibleSystemCursor
/Game/TopDown/Blueprints/Enumeration/E_CursorState
```

项目的 `DefaultEngine.ini` 已经把 Default、Hand、TextEditBeam 等 Software Cursor 全部映射到 `WBP_InvisibleSystemCursor`，因此这里不需要再次改工程配置，只需检查它没有被覆盖。

添加变量：

| 变量名 | 类型 | 默认值 | 用途 |
|---|---|---|---|
| `IntroWidgetClass` | WBP_GameIntro Class Reference | WBP_GameIntro | 要创建的页面 |
| `IntroWidgetRef` | WBP_GameIntro Object Reference | None | 保存实例 |
| `MouseCursorClass` | WBP_MouseCursor Class Reference | WBP_MouseCursor | 复用现有自定义鼠标 |
| `MouseCursorRef` | WBP_MouseCursor Object Reference | None | 保存 Intro 中的鼠标实例 |
| `GameplayLevelName` | Name | Prototype_07 | Start 后进入的关卡 |

如果 `WBP_GameIntro` 尚未创建，可以先跳过变量默认值，在第 04 部分回来补上。

## 3. PlayerController 的 BeginPlay

在 Event Graph 中建立：

```text
Event BeginPlay
→ Create Widget
    Class = IntroWidgetClass
    Owning Player = Self
→ Set IntroWidgetRef
→ Add to Viewport
    ZOrder = 100
→ Create Widget
    Class = MouseCursorClass
    Owning Player = Self
→ Set MouseCursorRef
→ Add to Viewport
    ZOrder = 9999
→ MouseCursorRef.SetCursorState
    New State = Normal
→ Set Input Mode Game and UI
    Player Controller = Self
    In Widget to Focus = IntroWidgetRef
    Mouse Lock Mode = Do Not Lock
    Hide Cursor During Capture = false
→ ApplyIntroCustomCursorMode
```

在 `BP_IntroPlayerController` 新建函数：

```text
ApplyIntroCustomCursorMode
→ Set Show Mouse Cursor = true
→ Set Enable Click Events = true
→ Set Enable Mouse Over Events = true
→ Set Current Mouse Cursor = None
→ Is Valid(MouseCursorRef)
→ Set Visibility
    Target = MouseCursorRef
    In Visibility = Not Hit-Testable (Self & All Children)
```

这对应正式 `BP_NoCharacterPlayerController.ApplyCustomCursorMode` 的规则，但函数建在 Intro Controller 内，避免让 Intro Controller 继承正式关卡的相机、HoverTrace 和其他 Gameplay 逻辑。

以后只要 Intro 中再次调用 `Set Input Mode Game and UI`，紧接着都调用一次 `ApplyIntroCustomCursorMode`。`SetCursorState(Normal)` 只需在创建鼠标时初始化，不必每次切换 Input Mode 都重置状态。

`Show Mouse Cursor = true` 在这里是为了让 Unreal 持续更新鼠标位置和 UI Hit Test，并不代表要显示 Windows 白色箭头。项目现有的 `WBP_InvisibleSystemCursor` 负责隐藏系统光标，玩家实际看到的是最上层的 `WBP_MouseCursor`。

检查一次现有项目设置：

```text
Project Settings
→ Engine
→ User Interface
→ Software Cursors
→ Default = WBP_InvisibleSystemCursor
```

如果项目里这个设置已经存在，不要重复修改，也不要新增 Hardware Cursor。

这些设置只属于 Intro PlayerController。进入 `Prototype_07` 后，原来的 `BP_NoCharacterPlayerController` 会重新创建并接管自己的鼠标和输入。

## 4. 添加自定义鼠标转发函数

在 `BP_IntroPlayerController` 创建函数：

```text
SetIntroCursorState
Input: NewState（E_CursorState）

Is Valid(MouseCursorRef)
→ MouseCursorRef.SetCursorState(NewState)
```

再创建：

```text
PlayIntroCursorClick

Is Valid(MouseCursorRef)
→ MouseCursorRef.Click
```

你的现有 `E_CursorState` 已有：

```text
Normal
Hover
Drag
```

Intro 按钮通常只使用 `Normal` 和 `Hover`。点击反馈继续调用 `WBP_MouseCursor` 内现有的 `Click`，由它播放 `Anim_Click`，不要在 Intro 里复制鼠标动画。

## 5. 让自定义鼠标跟随真实鼠标

现有 `WBP_MouseCursor` 只负责外观与状态；它的位置原本由 `BP_NoCharacterPlayerController` 更新。Intro 使用独立 Controller，因此必须在 `BP_IntroPlayerController` 补上最小的位置更新逻辑。

在 `BP_IntroPlayerController.Event Tick`：

```text
Event Tick
→ Is Valid(MouseCursorRef)
→ Branch
    Condition = Get Mouse Position Scaled by DPI.Return Value
→ Make Vector2D
    X = Location X
    Y = Location Y
→ Set Position in Viewport
    Target = MouseCursorRef
    Position = Make Vector2D
    Remove DPI Scale = false
```

`Get Mouse Position Scaled by DPI` 的 Player Controller 输入连接 `Self`。因为该节点已经输出 UMG 使用的 DPI 缩放坐标，所以 `Set Position in Viewport.Remove DPI Scale` 不勾选。

创建鼠标并 Add to Viewport 后，还可以初始化一次：

```text
MouseCursorRef.Set Alignment in Viewport
Alignment = (0, 0)
```

如果现有鼠标图片的热点不是中心点，就复制 `BP_NoCharacterPlayerController` 中原来的 Alignment 数值。不要显示系统光标来代替这一步；`WBP_InvisibleSystemCursor` 隐藏系统箭头是项目的既有设计。

不要为了 Intro 修改共享的 `WBP_MouseCursor` 默认设置。正式 Gameplay Controller 会通过自己的 `ApplyCustomCursorMode` 初始化它。Intro 实例由 `ApplyIntroCustomCursorMode` 处理：

```text
MouseCursorRef.Set Visibility
In Visibility = Not Hit-Testable (Self & All Children)
```

把节点接在鼠标 `Add to Viewport` 之后。自定义鼠标位于 ZOrder 9999，如果这个实例仍可命中，就会挡住正下方的 Start 按钮。

## 6. 创建 GM_Intro

创建 GameMode Base Blueprint：

```text
GM_Intro
```

Class Defaults：

```text
Player Controller Class = BP_IntroPlayerController
Default Pawn Class = None 或不生成可控制 Pawn 的空类
HUD Class = None
```

如果下拉框不能设置为 None，可保留默认 Pawn，但它不应包含相机或输入逻辑。Intro 页面本身不依赖 Pawn。

## 7. 把 GameMode 指定给 L_Intro

打开 `L_Intro`：

```text
World Settings
→ GameMode Override
→ GM_Intro
```

保存关卡。

此时不要立刻修改整个项目的 Game Default Map。先单独打开 `L_Intro` 并使用 Play 测试。

## 8. 临时测试 Widget

如果正式 Widget 尚未完成，先创建：

```text
WBP_GameIntro
```

只放：

- 一个铺满屏幕的深色 Border；
- 一个写着 `START` 的 Button。

把它设为 `IntroWidgetClass` 默认值。

运行 `L_Intro`，应看到 Widget、自定义鼠标，并且鼠标可以点击按钮。屏幕上不应同时出现 Windows 白色箭头。

## 9. 为什么不使用 Level Blueprint 创建 Widget

Level Blueprint 可以快速完成测试，但不建议作为最终结构。使用 `BP_IntroPlayerController` 的原因：

- UI 与输入属于本地 PlayerController；
- 不把页面逻辑绑定到关卡图；
- 后续更换 Intro 关卡内容时仍可复用；
- Start 的切关职责有明确归属；
- 与现有 Gameplay PlayerController 保持隔离。

## 10. 本部分验收

- [ ] `L_Intro` 已创建并保存。
- [ ] `GM_Intro` 已创建。
- [ ] `BP_IntroPlayerController` 已创建。
- [ ] `L_Intro.GameMode Override` 为 `GM_Intro`。
- [ ] `GM_Intro.PlayerControllerClass` 为 `BP_IntroPlayerController`。
- [ ] BeginPlay 能创建并显示 `WBP_GameIntro`。
- [ ] BeginPlay 只创建一个 `WBP_MouseCursor`，ZOrder 高于 Intro UI。
- [ ] Intro 中自定义鼠标可见，系统白色箭头不可见。
- [ ] Event Tick 使用 DPI 缩放坐标更新 `MouseCursorRef` 的 Viewport Position。
- [ ] 输入模式为 `Game and UI`，不是 `UI Only`。
- [ ] 没有修改 `BP_NoCharacterPlayerController`。

## 常见错误

### 运行后完全看不到 Widget

检查当前打开的关卡是否真的是 `L_Intro`，并确认 World Settings 的 GameMode Override。再用 Print String 输出当前 PlayerController Class。

### Widget 出现，但按钮无法点击

检查 `Set Input Mode Game and UI` 的 Player Controller 是否为 `Self`、Focus Widget 是否为 `IntroWidgetRef`、Show Mouse Cursor、Button 的 Visibility，以及是否有透明控件挡在按钮上方。

### 报错 SetInputMode expects a valid Player Controller

不要在 Widget 中把空引用接入 `Player Controller`。本方案把输入模式节点放在 `BP_IntroPlayerController.BeginPlay`，节点目标直接使用 `Self`。

### 同时看到自定义鼠标和 Windows 白色箭头

检查 Software Cursors 的 `Default` 是否仍为 `WBP_InvisibleSystemCursor`。不要通过关闭 `Show Mouse Cursor` 解决，否则 `WBP_MouseCursor` 的位置更新和 UI Hover 也可能失效。

### 出现两个自定义鼠标

说明 `WBP_MouseCursor` 被创建了两次。Intro 中只允许 `BP_IntroPlayerController` 创建它；不要再让 `WBP_GameIntro` 自己创建鼠标。

### 界面正常但完全看不到鼠标

确认 `MouseCursorRef` 创建成功，并检查 `BP_IntroPlayerController.Event Tick` 是否执行了 `Get Mouse Position Scaled by DPI → Set Position in Viewport`。只 Add to Viewport 不会让这个自定义鼠标自动跟随真实鼠标。

### 鼠标可见但 Start 无法点击

在 Intro Controller 中对 `MouseCursorRef` 调用 `Set Visibility = Not Hit-Testable (Self & All Children)`。不要直接修改共享资源。若仍无法点击，再确认 Intro 的视频、暗色遮罩和 Fade 等纯视觉层不可命中。

### 运行 Intro 时仍进入 Gameplay PlayerController

说明 `GM_Intro` 未生效。检查关卡 Override，而不是立即修改现有 Gameplay GameMode。
