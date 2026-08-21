# 第 05 部分：中央 Submission Widget 界面搭建

## 本部分目标

创建中央圆形 Submission 界面，包含：

- 可旋转的下层外圈；
- 静止的三圆与三角线稿；
- 三个透明圆形点击区域；
- 三个物品图标；
- 中央红色 Check Button；
- 全屏输入阻挡层。

本部分暂时不连接 Inventory 和骰子逻辑，只完成 Widget 结构与点击测试。

## 新入口方案前提

第 04 部分完成后，两个入口具有完全相同的职责：

```text
D 键 ───────────┐
                ├→ PlayerController.HandleOpenSubmissionInput
右上角红色图标 ─┘
                → OpenSubmissionPanel
```

它们都只负责打开本 Widget。真正执行骰子鉴定的唯一入口，是本 Widget 内的中央 `Button_Check`。

首次通过任意入口成功打开面板后，`OpenSubmissionPanel` 会把教学状态设置为 `Completed`。本 Widget 不再负责 `PointingToLauncher`，也不显示“必须点击右上角图标”的教学文字。

## 1. 打开或复制 `WBP_SubmissionPanel`

建议两种方式：

### 方式 A：直接修改旧 Widget

适合旧 Submission 逻辑已经很简单、引用较少。

### 方式 B：复制为 V2

复制旧 Widget，命名：

`WBP_SubmissionPanel_V2`

测试通过后再替换创建位置。

如果不确定，优先使用方式 B，便于随时对比旧功能。

以下文档仍统一称为 `WBP_SubmissionPanel`。

## 2. Root 结构

建议 Designer 层级：

```text
Canvas_Root
├─ Button_BackdropBlocker
└─ ScaleBox_Submission
   └─ SizeBox_DesignCanvas
      └─ Canvas_Submission
         ├─ Image_OuterRing
         ├─ Image_InnerLineArt
         ├─ Button_Slot0
         │  └─ Image_Item0
         ├─ Button_Slot1
         │  └─ Image_Item1
         ├─ Button_Slot2
         │  └─ Image_Item2
         └─ Button_Check
            └─ Image_CheckIcon（可选）
```

## 3. 配置全屏 Root

### `Canvas_Root`

- Anchors：Full Screen。
- Offsets：0。
- Visibility：Visible。

### `Button_BackdropBlocker`

用途：阻止点击穿透到游戏世界。

- Anchors：Full Screen。
- Offsets：0。
- Button Style：完全透明。
- Is Focusable：False。
- 点击时不要关闭面板，鉴定过程中尤其不能关闭。

如果希望选择阶段点击空白关闭，可以后续增加条件：只有 `Selecting`/`Ready` 且未开始 Check 时允许。

## 4. 使用 ScaleBox 保持比例

### `ScaleBox_Submission`

- Anchor：屏幕中心。
- Alignment：`0.5, 0.5`。
- Stretch：`Scale to Fit`。
- Stretch Direction：Both 或 Down Only，根据你的目标分辨率测试。
- 建议占屏幕宽度约 55%–65%。

### `SizeBox_DesignCanvas`

- Width Override：1672。
- Height Override：941。

这样内部控件可以直接使用设计稿坐标，ScaleBox 负责整体缩放。

## 5. 添加内层线稿

### `Image_InnerLineArt`

- Anchor：左上。
- Position：`0, 0`。
- Size：`1672 × 941`。
- Brush：`T_UI_Submission_InnerLineArt`。
- Visibility：Self Hit Test Invisible。
- ZOrder：建议 10。

确认：

- 三个圆内部透明；
- 没有黑色圆面和黑边；
- 三角形与中央按钮线稿可见。

## 6. 添加旋转外圈

使用正方形素材：

`T_UI_Submission_OuterRing_Rotation`

### `Image_OuterRing`

- Size：`941 × 941`。
- 设计稿中外圈视觉中心约 `(835, 470)`。
- 因此 Image 左上位置约：

```text
X = 835 - 470.5 ≈ 364.5
Y = 470 - 470.5 ≈ -0.5
```

可先设置：

- Position X：365。
- Position Y：0。
- Size：941 × 941。
- Alignment：0,0。
- Render Transform Pivot：`0.5, 0.5`。
- Visibility：Self Hit Test Invisible。
- ZOrder：0，放在内层线稿下面。

如果你的实际美术对齐有 1–2 px 偏差，可以在 Designer 中微调，但不要缩放成非等比。

## 7. 添加三个槽位 Button

设计稿参考中心：

- Slot 0：`(594, 303)`
- Slot 1：`(1076, 303)`
- Slot 2：`(835, 703)`

建议点击区域直径：200–220 px。

先使用 210 × 210：

### `Button_Slot0`

- Position：`489, 198`。
- Size：`210 × 210`。
- ZOrder：20。

### `Button_Slot1`

- Position：`971, 198`。
- Size：`210 × 210`。
- ZOrder：20。

### `Button_Slot2`

- Position：`730, 598`。
- Size：`210 × 210`。
- ZOrder：20。

Button Style：

- Normal/Hovered/Pressed 都可以使用透明 Brush；
- Hover 时可通过内部 Overlay 加一层红色低透明圆形提示；
- Is Focusable：True 或根据鼠标交互需要设置。

注意：UMG Button 默认是矩形命中区域。当前美术中三个圆间距足够，使用透明矩形不会互相重叠。如果希望严格圆形命中，需要额外逻辑，不建议第一版增加复杂度。

## 8. 添加物品图标

每个 Button 内放一个 Image：

- `Image_Item0`
- `Image_Item1`
- `Image_Item2`

设置：

- Horizontal/Vertical Alignment：Fill 或 Center。
- Padding：约 30–40 px。
- Preserve Aspect Ratio：通过 ScaleBox 或合适 Brush Drawing Size 保持。
- Visibility 初始为 Hidden 或 Collapsed。
- Visibility 设为 Hit Test Invisible，避免遮挡 Button 点击。

## 9. 添加中央 Check Button

参考中心：`(835, 452)`。

建议点击区域：150 × 150。

### `Button_Check`

- Position：`760, 377`。
- Size：`150 × 150`。
- ZOrder：30。
- 初始 Is Enabled：False。

Button 的红色圆面可以：

- 使用单独红色圆形纹理；或
- 使用已有中央红色图标；或
- 在 Button 内放 `Image_CheckIcon`。

不要把 Check Button 放进 `Image_OuterRing` 的子层级，否则旋转时按钮可能一起转。

## 10. 设置 Widget 可聚焦

在 Widget Class Defaults：

- `Is Focusable = True`。

这样 PlayerController 在打开面板时可以把 User Focus 给它。

## 11. 创建 UI 状态 Enum

在 Content Browser 新建 Blueprint Enumeration：

`E_SubmissionUIState`

枚举值：

- `Closed`
- `Selecting`
- `Ready`
- `Checking`
- `FadingOut`

在 Widget 新增变量：

- `SubmissionState`，类型 `E_SubmissionUIState`，默认 `Closed`。
- `ActiveSlotIndex`，Integer，默认 `-1`。
- `CoreDeviceRef`，`BP_CoreDevice` Reference，Expose on Spawn 可选。
- `PlayerControllerRef`，`BP_NoCharacterPlayerController` Reference。
- `InventoryPanelRef`，`WBP_InventoryPanel` Reference。

## 12. 创建 `InitializeSubmissionPanel`

新建 Function：

`InitializeSubmissionPanel`

节点顺序：

```text
Set Render Opacity(Canvas_Root) = 1
→ Set SubmissionState = Selecting
→ Set ActiveSlotIndex = -1
→ Set Button_Check Is Enabled = False
→ Set 三个 Slot Button Is Enabled = True
→ RefreshSlotVisuals
→ RefreshSubmissionState
```

`RefreshSlotVisuals` 后续第 06 部分再实现。

### 12.1 把初始化接入 `OpenSubmissionPanel`

回到 `BP_NoCharacterPlayerController.OpenSubmissionPanel`。无论是复用已有 Widget，还是第一次创建 Widget，都必须在面板显示后调用一次初始化。

复用已有 Widget：

```text
Set Visibility(Visible)
→ SubmissionPanelRef.InitializeSubmissionPanel
→ EnterSubmissionUIMode
→ 继续第 04 部分已经完成的教学 Completed 判断
```

第一次创建 Widget：

```text
Create WBP_SubmissionPanel
→ Set SubmissionPanelRef
→ 设置 SubmissionPanelRef.CoreDeviceRef = CoreDeviceRef
→ 设置 SubmissionPanelRef.PlayerControllerRef = Self
→ Add to Viewport
→ SubmissionPanelRef.InitializeSubmissionPanel
→ EnterSubmissionUIMode
→ 继续第 04 部分已经完成的教学 Completed 判断
```

如果 `CoreDeviceRef`、`PlayerControllerRef` 已经设为 `Expose on Spawn`，就在 `Create Widget` 节点上直接传入，不必再使用 Set。

不要从 `InitializeSubmissionPanel` 修改 `SubmissionTutorialState`。教学完成仍统一由 PlayerController 的 `OpenSubmissionPanel` 处理。

## 13. 暂时连接点击测试

Graph 中：

```text
Button_Slot0 OnClicked → Print "Slot 0"
Button_Slot1 OnClicked → Print "Slot 1"
Button_Slot2 OnClicked → Print "Slot 2"
Button_Check OnClicked → Print "Check"
```

从 PlayerController 临时打开 Widget，确认点击区域与视觉圆位置匹配。

## 14. 响应式测试

至少测试：

- 1920 × 1080；
- 1600 × 900；
- 2560 × 1440；
- 编辑器窗口缩放。

检查：

- 三圆、三角形与外圈保持同一中心；
- Button 点击区域跟着整体 ScaleBox 缩放；
- 外圈不被裁切；
- Widget 不超过屏幕上下边缘。

## 15. 常见错误

### 外圈旋转中心偏移

- 使用 941 × 941 正方形素材；
- Pivot 0.5,0.5；
- 不要让 Image 产生非等比拉伸；
- 检查 Position 是否约为 365,0。

### 点击槽位没有反应

- 检查内层 Image 的 Visibility 是否误设为 Visible 并拦截点击；
- 图片应使用 `Self Hit Test Invisible`；
- Button ZOrder 要高于图片。

### 物品图标拦截 Button

- Item Image 设置为 `Hit Test Invisible`。

## 16. 本部分验收

- [ ] 面板在屏幕中央并等比缩放。
- [ ] 外圈和内层正确叠合。
- [ ] 外圈 Pivot 正确。
- [ ] 三个 Button 与三个圆对齐。
- [ ] 中央 Button 与红色圆对齐。
- [ ] 四个按钮都能输出正确测试信息。
- [ ] 图片不拦截按钮点击。
- [ ] D 键和右上角红色图标都能打开同一个 Widget。
- [ ] 两条打开路径都会调用 `InitializeSubmissionPanel`。
- [ ] 打开面板不会自动执行骰子鉴定。
