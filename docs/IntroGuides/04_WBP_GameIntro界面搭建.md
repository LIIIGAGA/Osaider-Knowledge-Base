# 第 04 部分：WBP_GameIntro 界面搭建

## 本部分目标

完成全屏 Intro 页面结构，包括静态回退背景、视频 Image、暗色遮罩、标题、状态文字和 Start 按钮，并制作进入与退出动画。

## 1. 创建或打开 Widget

资源位置：

```text
Content/Osaider/Intro/UI/WBP_GameIntro
```

Root 使用：

```text
Canvas Panel
```

建议组件层级：

```text
Canvas_Root
├─ IMG_Fallback
├─ SBOX_VideoCrop
│  └─ IMG_Video
├─ Border_DarkOverlay
├─ SafeZone_Content
│  └─ Canvas_Content
│     ├─ TXT_Registry
│     ├─ TXT_Title
│     ├─ TXT_Subtitle
│     ├─ BTN_Start
│     │  └─ TXT_Start
│     └─ TXT_LoadState
└─ Border_Fade
```

## 2. 设置静态回退背景

选中 `IMG_Fallback`：

- Anchors：全屏；
- Offsets：全部为 0；
- Brush Image：`T_Intro_Fallback`；
- Visibility：Visible；
- ZOrder：0。

回退图不需要在视频成功后删除。它可以一直留在视频下方，避免视频第一帧尚未到达时露出纯黑背景。

## 3. 设置视频 Image

选中 `IMG_Video`：

```text
Brush Image = MT_Intro
```

确保它位于回退图上方。

宽高比策略：

### 全屏裁切，推荐

使用 `Scale Box` 包住 `IMG_Video`：

```text
Stretch = Scale To Fill
Stretch Direction = Both
```

目标是填满屏幕并保持比例，允许画面边缘被裁掉。视频主体应提前放在中央安全区域。

### 完整显示

如果不能裁切视频，使用 `Scale To Fit`，但非 16:9 屏幕可能出现黑边。

不要直接把视频强行拉伸到任意比例，这会让宫殿和圆形机械结构变形。

## 4. 添加暗色遮罩

`Border_DarkOverlay`：

- Anchors：全屏；
- Brush Color：深海军蓝或黑色；
- Opacity：约 0.25–0.45；
- Hit Test：不可命中。

遮罩用于：

- 稳定文字对比度；
- 让背景视频保持氛围而不是抢夺注意力；
- 保持 Osaider 约 80% 中性深色的视觉规则。

## 5. 安全区域与文字

把文字和按钮放入 Safe Zone。

建议第一版内容：

```text
Registry: PALACE RECORD / ENTRY 000
Title: OSAIDER
Subtitle: THE ARCHIVE IS READY
Button: START
Load State: INITIALIZING RECORD...
```

视觉规则：

- 标题使用紧缩无衬线或现有标题字体；
- 元数据使用大写、较宽字距；
- Start 用氧化黄铜强调；
- 不要同时把 Start 做成红色或蓝色阵营按钮；
- 边框使用 1–2 px 视觉重量；
- 避免夸张蒸汽朋克装饰。

## 6. Start 按钮

命名：

```text
BTN_Start
TXT_Start
```

按钮状态建议：

### Normal

- 深色或透明背景；
- 黄铜细边框；
- 文字为浅灰／旧纸色。

### Hovered

- 边框亮度提高；
- 文字略微提亮；
- 可增加 2–4 px 内部线框移动。

### Pressed

- 短促向内压缩；
- 持续时间约 80–120 ms；
- 不使用弹性或卡通回弹。

### 连接现有自定义鼠标

不要在 `WBP_GameIntro` 内创建 `WBP_MouseCursor`。它已经由 `BP_IntroPlayerController` 创建，Intro Widget 只转发按钮状态。

在 `WBP_GameIntro.Event Construct`：

```text
Get Owning Player
→ Cast to BP_IntroPlayerController
→ Promote to Variable：IntroPCRef
```

为 `BTN_Start` 添加：

```text
BTN_Start.OnHovered
→ Is Valid(IntroPCRef)
→ IntroPCRef.SetIntroCursorState(Hover)

BTN_Start.OnUnhovered
→ Is Valid(IntroPCRef)
→ IntroPCRef.SetIntroCursorState(Normal)

BTN_Start.OnPressed
→ Is Valid(IntroPCRef)
→ IntroPCRef.PlayIntroCursorClick
```

`OnClicked` 仍负责 Start 的正式流程，详见第 06 部分。鼠标 Click 动画放在 `OnPressed`，反馈会更及时。

纯视觉控件使用 `Not Hit-Testable`；`Canvas_Content` 使用 `Not Hit-Testable (Self Only)`；`BTN_Start` 自身必须保持 `Visible`，否则 Hover 事件不会触发。

Intro Controller 创建 `WBP_MouseCursor` 后，必须对 `MouseCursorRef` 调用 `Set Visibility = Not Hit-Testable (Self & All Children)`。只修改 Intro 实例，不更改正式关卡共享鼠标资源的默认设置。

## 7. 加载状态文字

`TXT_LoadState` 初始显示：

```text
INITIALIZING RECORD...
```

视频打开成功后改为隐藏或：

```text
RECORD AVAILABLE
```

视频打开失败时可以改为：

```text
VISUAL RECORD UNAVAILABLE
```

不要因为视频失败而隐藏 Start。

## 8. 创建动画

创建两个 UMG Animation：

```text
ANIM_IntroAppear
ANIM_IntroExit
```

### `ANIM_IntroAppear`

建议 0.5–0.8 秒：

- `SafeZone_Content` Render Opacity：0 → 1；
- 内容向上或向侧面移动 8–12 px；
- Start 最后出现；
- 不使用弹性曲线。

### `ANIM_IntroExit`

建议 0.35–0.6 秒：

- `SafeZone_Content` Render Opacity：1 → 0；
- `Border_Fade` Render Opacity：0 → 1；
- Fade 颜色使用深海军蓝或黑色。

`Border_Fade` 必须位于最高 ZOrder，并设为不可命中，避免平时阻挡按钮。

## 9. 可访问性

- Start 的可点击区域至少约 160 × 48 px；
- 不仅依靠黄铜颜色表达 Hover，可同时改变线框或文字；
- 保持标题和背景的清晰对比；
- 未来可在 Settings 中提供 Reduced Motion；
- 重要文本不要放在视频高频运动区域。

## 10. 本部分验收

- [ ] 回退图铺满屏幕。
- [ ] `IMG_Video` 使用 `MT_Intro`。
- [ ] 视频按比例填充，不被非等比拉伸。
- [ ] 暗色遮罩不会阻挡鼠标。
- [ ] 标题和 Start 位于安全区域。
- [ ] Start 的 Normal、Hovered、Pressed 状态清晰。
- [ ] Start Hover 时 `WBP_MouseCursor` 切换为 `Hover`，离开时恢复 `Normal`。
- [ ] Start Pressed 时调用现有鼠标的 `Click` 动画。
- [ ] `ANIM_IntroAppear` 和 `ANIM_IntroExit` 已创建。
- [ ] Fade 层位于最上方但不阻挡点击。

## 常见错误

### 视频人物或宫殿被裁掉

Scale To Fill 会在非 16:9 屏幕裁边。调整视频构图安全区，或改用 Scale To Fit 接受黑边。

### Start 看得见但无法点击

检查 `Border_DarkOverlay`、`IMG_Video` 和 `Border_Fade` 的 Hit Test Visibility。纯视觉层应使用 Not Hit-Testable。

### 视频铺满了，但圆形结构变成椭圆

说明 Image 被直接非等比拉伸。使用 Scale Box 保持宽高比。
