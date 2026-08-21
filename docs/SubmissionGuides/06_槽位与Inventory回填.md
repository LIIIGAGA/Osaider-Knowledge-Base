# 第 06 部分：槽位点击、Inventory 打开与物品回填

## 本部分目标

实现：

```text
点击圆形槽位
→ 记录 ActiveSlotIndex
→ 打开现有 WBP_InventoryPanel
→ InitInventory
→ 点击物品
→ 回填对应槽位
→ 更新 BP_CoreDevice.SubmittedItems
→ 三槽填满后启用中央按钮
```

本部分只处理“面板已经打开以后”的槽位与 Inventory 交互。D 键和右上角红色图标不能直接打开 Inventory，也不能执行骰子鉴定；它们只打开 `WBP_SubmissionPanel`。

## 1. 确认 `SubmittedItems` 的初始化方式

打开 `BP_CoreDevice`。

`SubmittedItems` 应能够稳定表示三个槽位。

推荐：数组 Length 始终为 3。

如果当前数组初始为空，可以在 `BP_CoreDevice.BeginPlay` 或初始化函数中：

1. Clear `SubmittedItems`。
2. 添加三个“空值”或默认 Struct。

必须使用你当前 ItemDataType 的合法空值表示方式。

如果当前系统已经有三个固定 Slot 变量，则可以暂时保留，不强制改数组。

## 2. 在 `BP_CoreDevice` 创建槽位 Setter

新建 Function：

`SetSubmittedItemAtSlot`

输入：

- `SlotIndex`：Integer。
- `ItemData`：ItemDataType。

输出：

- `Success`：Boolean。

节点顺序：

```text
SlotIndex >= 0 AND SlotIndex < 3
→ Branch
  False → Success False
  True
    → 检查 ItemData 是否有效
    → 检查其他槽位是否已经使用同一物品
    → Branch
      Duplicate → Success False
      Valid
        → Set Array Elem
           Index = SlotIndex
           Item = ItemData
           Size to Fit = True（仅在数组长度可能不足时）
        → Success True
```

### 如何判断重复

优先使用稳定唯一字段：

- ItemID；
- DataTable Row Name；
- Object Reference；
- 其他唯一 ID。

不要只比较显示名称，除非项目确认名称唯一。

## 3. 在 Submission Widget 创建 `OpenInventoryForSlot`

输入：

- `SlotIndex`：Integer。

节点顺序：

```text
SubmissionState == Selecting OR Ready
→ Branch
  False → Return
  True
    → Set ActiveSlotIndex = SlotIndex
    → Is Valid(InventoryPanelRef)
    → Branch
      False
        → Create Widget(WBP_InventoryPanel)
        → Set InventoryPanelRef
        → Add to Viewport 或放入预留容器
      True
        → Set Visibility Visible
    → 给 Inventory 设置 SubmissionPanelRef = Self
    → 给 Inventory 设置 ActiveSlotIndex
    → 传入当前 SubmittedItems 作为 Excluded Items
    → Call InitInventory
    → Set Focus 到 Inventory
```

## 4. 连接三个 Slot Button

```text
Button_Slot0 OnClicked → OpenInventoryForSlot(0)
Button_Slot1 OnClicked → OpenInventoryForSlot(1)
Button_Slot2 OnClicked → OpenInventoryForSlot(2)
```

删除第 05 部分的临时 Print。

## 5. 修改 `WBP_InventoryPanel`

新增变量：

### `SubmissionPanelRef`

- 类型：`WBP_SubmissionPanel` Reference。
- Expose on Spawn 可选。

### `ActiveSlotIndex`

- Integer，默认 -1。

### `ExcludedSubmittedItems`

- ItemDataType Array。
- 用于在列表中禁用已经被其他槽位使用的物品。

### `bOpenedForSubmission`

- Boolean。
- 防止 Inventory 在普通浏览模式下错误调用 Submission。

## 6. 在 `InitInventory` 中处理禁用状态

保持原来创建 Item Entry 的逻辑。

在每个 Entry 创建后增加：

```text
bOpenedForSubmission
→ Branch
  False → 保持普通 Inventory 行为
  True
    → ExcludedSubmittedItems Contains ItemData（按唯一 ID 判断）
    → Set Item Button Is Enabled = NOT Duplicate
```

注意：当前正在编辑的槽位中原有物品可以允许重新选择，也可以先从 Excluded 数组中排除当前 Slot 的物品。

## 7. 修改 Inventory Item 点击事件

找到现有物品按钮 OnClicked。

先分流：

```text
Branch(bOpenedForSubmission)
False → 走原来的 Inventory 点击逻辑
True
  → Is Valid(SubmissionPanelRef)
  → SubmissionPanelRef.AssignItemToSlot(ActiveSlotIndex, ItemData)
  → 根据返回 Success
      True → Close/Collapse Inventory
      False → 显示 Duplicate / Invalid 提示
```

不要破坏普通 Inventory 浏览模式。

## 8. 在 Submission Widget 创建 `AssignItemToSlot`

输入：

- `SlotIndex`：Integer。
- `ItemData`：ItemDataType。

输出：

- `Success`：Boolean。

节点顺序：

```text
Is Valid(CoreDeviceRef)
→ CoreDeviceRef.SetSubmittedItemAtSlot(SlotIndex, ItemData)
→ Branch(Success)
  False → Return False
  True
    → UpdateSlotVisual(SlotIndex, ItemData)
    → RefreshSubmissionState
    → Set ActiveSlotIndex = -1
    → Set User Focus(Self)
    → Return True
```

## 9. 创建 `UpdateSlotVisual`

输入：

- `SlotIndex`
- `ItemData`

使用 `Switch on Int`：

```text
0 → Set Brush From Texture(Image_Item0, ItemData.Icon)
    → Set Visibility Hit Test Invisible
1 → Image_Item1
2 → Image_Item2
```

如果 Icon 不是 Texture2D，而是 Slate Brush，使用匹配节点。

## 10. 创建 `RefreshSlotVisuals`

用于每次面板打开时读取现有 `SubmittedItems`。

节点逻辑：

1. For Loop 0–2。
2. 获取 `SubmittedItems[Index]`。
3. 判断有效：
   - 有效 → UpdateSlotVisual；
   - 空 → 对应 Image Visibility Hidden。

这样关闭再打开时不会丢失当前槽位显示。

## 11. 创建 `RefreshSubmissionState`

节点顺序：

```text
CoreDeviceRef.AreAllSlotsFilled
→ Branch
  True
    → Set SubmissionState = Ready
    → Set Button_Check Is Enabled = True
    → 可选 Play Ready Pulse
  False
    → Set SubmissionState = Selecting
    → Set Button_Check Is Enabled = False
```

注意：如果当前处于 `Checking` 或 `FadingOut`，不要把状态改回 Selecting。

函数开始先检查：

```text
SubmissionState == Checking OR FadingOut
→ True: Return
```

## 12. 可选：允许点击已填槽位进行替换

点击已填槽位仍然调用 `OpenInventoryForSlot(Index)`。

打开 Inventory 时：

- Excluded 数组包含另外两个槽位的物品；
- 不包含当前槽位原物品；
- 玩家可以重新选择同一个或换成新物品。

## 13. 可选：清空单个槽位

如果需要右键或小型 Remove Button：

创建：

`ClearSubmittedSlot(SlotIndex)`

流程：

- 把数组该元素设为空；
- 隐藏对应 Image；
- RefreshSubmissionState。

第一版不是必需，先保证选择和替换稳定。

## 14. 本部分测试

### 槽位 0

1. 点击左上圆。
2. Inventory 打开。
3. 选择物品 A。
4. A 图标只出现在左上圆。

### 槽位 1 和 2

重复测试，确认 Index 不串位。

### 重复物品

1. Slot 0 放 A。
2. 打开 Slot 1 Inventory。
3. A 应被禁用。
4. 即使 UI 禁用失效，CoreDevice Setter 也应拒绝重复。

### 三槽状态

- 0–2 个物品：Check Disabled。
- 3 个有效不重复物品：Check Enabled，状态 Ready。

### 关闭重开

- 关闭面板再打开。
- 三个图标应从 `SubmittedItems` 正确恢复。

## 15. 常见错误

### 所有槽位都填到 Slot 0

- 检查点击时是否先设置 `ActiveSlotIndex`；
- 检查 Inventory 是否收到正确 Index；
- 检查 Item 点击是否把该 Index 传回。

### 选择物品后 Inventory 关了，但槽位没图标

- Setter 可能失败；
- ItemData Icon 字段可能为空；
- Image Visibility 仍为 Hidden；
- Brush 节点类型可能不匹配。

### 普通 Inventory 点击功能坏了

- 必须使用 `bOpenedForSubmission` 分流；
- False 时保持旧逻辑原样。

## 16. 本部分验收

- [ ] 三个槽位分别打开 Inventory。
- [ ] 物品回填位置正确。
- [ ] 普通 Inventory 模式不受影响。
- [ ] 同一物品不能重复使用。
- [ ] 三槽填满后 Check 启用。
- [ ] 关闭重开后图标仍正确。
- [ ] 点击右上角红色图标或按 D 只打开 Submission，不会自动打开 Inventory。
- [ ] 只有点击三个小圆槽位才会打开 Inventory。
