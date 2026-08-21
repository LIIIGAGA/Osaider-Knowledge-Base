# OSAIDER 三物品上缴机 UI 设计稿 v1

## 画面结构

- 展开面板：右侧固定，参考尺寸约 `310 × 690 px`（基于 `1600 × 1000` 设计画布）。
- 顶部：`SUBMIT` 按钮，并显示 `[ ENTER ]` 键盘提示。
- 中部上方：骰子结果屏，依次显示检定类型、点数与结果。
- 中部下方：三个纵向物品槽位，每个槽位包含提示灯、正方形图标框和编号。
- 底部：输入计数 `3 / 3 INPUT`。
- 左侧小标签：点击后收起；收起时仅保留标签，方便再次展开。

## 状态建议

1. `0–2 / 3`：SUBMIT 按钮低亮，结果屏显示 `INSERT ITEMS`。
2. `3 / 3`：三个槽位灯全部点亮，SUBMIT 按钮和提示灯轻微闪烁。
3. 点击 SUBMIT 或按 Enter：锁定槽位，结果屏显示 `ANALYZING...`。
4. 完成检定：显示 `ROLL 6 / TARGET 4` 和 `SUCCESS`；失败时改为红色 `FAILED`。

## 配色

- 背景：`#050607`，透明度约 88%。
- 主操作红：`#EF2B1F`。
- 信息青：`#00D9E8`。
- 文字米白：`#E9E1D0`。
- 未激活线框：`#34393B`。

## UE 资产拆分

- `T_UI_SubmissionPanel_Frame`
- `T_UI_SubmitButton_Normal`
- `T_UI_SubmitButton_Ready`
- `T_UI_ResultScreen_Frame`
- `T_UI_Slot_Frame`
- `T_UI_CollapseTab`

文字、物品图标、指示灯和结果内容建议继续在 UMG 中独立制作，不要烘焙进背景 PNG。
