# 第 04 部分：WBP_CycleReflection 界面搭建

## 本部分目标

完成全屏黑色反思界面、红蓝噪点背景、中央问题区、可复用选项和最终决定区。界面保持极简，不做成档案表格或阵营选择菜单。

## 1. WBP_CycleReflection Root

打开：

```text
Content/Osaider/CycleReflection/UI/WBP_CycleReflection
```

Root 使用：

```text
Canvas Panel
```

推荐层级：

```text
Canvas_Root
├─ Border_Black
├─ ScaleBox_Background
│  └─ IMG_Background
├─ SafeZone_Content
│  └─ SizeBox_ContentWidth
│     └─ Overlay_Content
│        ├─ VB_QuestionPage
│        │  ├─ TXT_Progress
│        │  ├─ Spacer_QuestionTop
│        │  ├─ TXT_Question
│        │  ├─ Spacer_QuestionOptions
│        │  └─ VB_Options
│        └─ VB_FinalDecision
│           ├─ TXT_FinalDecision
│           ├─ Spacer_FinalButtons
│           └─ HB_FinalButtons
│              ├─ BTN_Restart
│              │  └─ TXT_Restart
│              └─ BTN_Leave
│                 └─ TXT_Leave
└─ Border_Transition
```

## 2. 全屏背景

`Border_Black`：

```text
Anchors = Full Screen
Offsets = 0
Brush Color = #020204
Visibility = Not Hit-Testable (Self & All Children)
ZOrder = 0
```

`ScaleBox_Background`：

```text
Anchors = Full Screen
Offsets = 0
Stretch = Scale To Fill
Stretch Direction = Both
Clipping = Clip to Bounds
Visibility = Not Hit-Testable (Self & All Children)
ZOrder = 1
```

`IMG_Background`：

```text
Brush Image = T_CycleReflection_BG_2560x1440
Color and Opacity = White
Visibility = Not Hit-Testable (Self & All Children)
```

不要直接把 `IMG_Background` 非等比拉满 Canvas。使用 Scale Box 保持 16:9 比例，非 16:9 分辨率只裁切边缘。

`Border_Transition`：

```text
Anchors = Full Screen
Offsets = 0
Brush Color = Black
Visibility = Not Hit-Testable (Self & All Children)
ZOrder = 100
```

`Border_Transition` 只用于题目之间和切关前的短淡出，不负责长期背景。

## 3. 中央安全区域

`SafeZone_Content`：

- Anchors：全屏；
- Alignment：中央；
- Padding：左右至少 72，顶部和底部至少 48；
- ZOrder：10。

`SizeBox_ContentWidth`：

```text
Max Desired Width = 1120
Min Desired Width = 720（仅桌面 16:9 第一版）
```

如果未来支持 1280 × 720 或 Steam Deck，移除固定 Min Width，只保留 Max Width 与 Safe Zone。

中央内容整体垂直居中，但长文本出现时允许向上偏移约 40–70 px，避免最后一项贴近屏幕底部。

## 4. 问题页排版

`TXT_Progress`：

```text
示例 = 01 / 05
字体大小 = 14–16
颜色 = #68656D
字距 = 150–220
Justification = Center
```

它应非常弱，只帮助玩家理解流程长度。

`TXT_Question`：

```text
字体大小 = 34–42（1920 × 1080）
颜色 = #D8D5CF
Justification = Center
Auto Wrap Text = true
Wrapping Policy = Allow Per Character Wrapping
Line Height Percentage = 1.12–1.22
```

不要把问题染成红色或蓝色。

`VB_Options`：

- 每项间距 14–22 px；
- 总宽度服从 `SizeBox_ContentWidth`；
- 根据 Options 数组动态加入 `WBP_CycleReflectionOption`；
- 不使用三列布局。流程图的三列是逻辑示意，游戏中长文本应纵向排列。

## 5. 创建 WBP_CycleReflectionOption

打开：

```text
WBP_CycleReflectionOption
```

推荐层级：

```text
SizeBox_HitArea
└─ BTN_Option
   └─ Border_OptionVisual
      └─ HB_Option
         ├─ Border_Marker
         ├─ Spacer_MarkerText
         └─ TXT_Option
```

推荐属性：

```text
SizeBox Min Desired Height = 58
Button Normal Background = Transparent
Button Hovered Background = 极淡中性灰
Button Pressed Background = 略亮中性灰
Border Padding = 18, 12
TXT_Option Font Size = 19–23
TXT_Option Color = #B9B6B1
TXT_Option Auto Wrap = true
TXT_Option Justification = Left
```

`Border_Marker` 可以是 2 × 18 px 的中性灰竖线。

Hover 时：

- 文字从 `#B9B6B1` 提亮至 `#E2DFD8`；
- Marker 从低透明度变为清晰；
- 整项向右移动 4 px；
- 不使用红、蓝或黄铜作为 Hover 判定。

Pressed 时使用 80–120 ms 的轻微压缩或透明度变化，不使用弹跳。

## 6. Option Widget 变量与 Dispatcher

添加变量：

| 变量名 | 类型 | 用途 |
|---|---|---|
| `OptionIndex` | Integer | 当前选项位置 |
| `OptionText` | Text | 显示内容 |
| `bLocked` | Boolean | 动画中阻止输入 |

添加 Event Dispatcher：

```text
OnOptionSelected
Input: SelectedIndex (Integer)
```

创建函数：

```text
InitializeOption
Inputs:
- InIndex (Integer)
- InText (Text)
```

流程：

```text
Set OptionIndex = InIndex
Set OptionText = InText
TXT_Option.SetText(InText)
Set bLocked = false
```

`BTN_Option.OnClicked`：

```text
Branch: bLocked == false
→ Set bLocked = true
→ Call OnOptionSelected(OptionIndex)
```

不要在 Option Widget 中访问 CoreDevice、Game Instance、关卡或其他问题。

## 7. 自定义鼠标

`WBP_CycleReflection` 不创建新的 `WBP_MouseCursor`。

它继续使用 `BP_NoCharacterPlayerController.CursorWidgetRef` 中已有的鼠标实例。Option 的事件只转发状态：

```text
OnHovered
→ Owning Player.SetCursorState(Hover)

OnUnhovered
→ Owning Player.SetCursorState(Normal)

OnPressed
→ Owning Player.PlayCursorClick
```

函数名以项目当前 PlayerController 中实际存在的鼠标转发函数为准。不要复制一个新的鼠标系统。

最上层自定义鼠标必须保持高于 Reflection Widget，例如：

```text
Reflection UI ZOrder = 900
CursorWidgetRef ZOrder = 999（项目当前值）
```

鼠标 Widget 必须是 `Not Hit-Testable`，否则会挡住选项。

## 8. 最终决定区

`VB_FinalDecision` 初始：

```text
Visibility = Collapsed
```

`TXT_FinalDecision`：

- 字体大小 25–31；
- 行宽最大 960；
- 居中；
- 自动换行；
- 警告段不使用橙色大框；
- 可以用较低亮度或细分隔线区分提醒内容。

`BTN_Restart` 与 `BTN_Leave`：

- 视觉权重相同；
- 不把 Restart 做红色、Leave 做蓝色；
- 不预设哪个是正确选择；
- 宽度各 260–340，高度至少 56；
- 按钮间距 32–64。

## 9. 动画资源

创建：

```text
ANIM_ScreenEnter
ANIM_QuestionEnter
ANIM_QuestionExit
ANIM_FinalEnter
ANIM_TravelOut
```

建议时长：

| 动画 | 时长 | 内容 |
|---|---:|---|
| `ANIM_ScreenEnter` | 1.2–1.4 s | 世界淡黑、噪点随后出现 |
| `ANIM_QuestionEnter` | 0.35–0.50 s | 问题与选项淡入、上移 6–10 px |
| `ANIM_QuestionExit` | 0.20–0.30 s | 当前问题淡出 |
| `ANIM_FinalEnter` | 0.50–0.75 s | 最终文本与按钮缓慢出现 |
| `ANIM_TravelOut` | 0.35–0.55 s | 内容消失，保持全黑后切关 |

所有移动使用线性或缓入缓出，不使用弹性曲线。

## 10. 低分辨率保护

在 `SafeZone_Content` 内增加 `ScrollBox` 作为可选保护层。正常 1080p 不显示滚动条；当内容高度超过安全区时允许鼠标滚轮滚动。

不要使用 Scale Box 把长中文整体缩小到不可读。优先顺序：

1. 减少上下 Spacer；
2. 字体从 22 降至 19；
3. 启用 ScrollBox；
4. 最后才略微缩放整体。

## 11. 本部分验收

- [ ] 黑底、噪点与内容层级正确。
- [ ] 三个长选项使用纵向列表。
- [ ] 所有文本自动换行。
- [ ] Option Widget 只广播 Index。
- [ ] Hover 使用中性色，不暗示阵营。
- [ ] 最终两个按钮视觉权重相同。
- [ ] 自定义鼠标位于 UI 上方但不阻挡点击。
- [ ] 五个动画已建立。
