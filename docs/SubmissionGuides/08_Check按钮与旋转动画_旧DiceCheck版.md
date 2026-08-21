# 08 中央 Check 按钮与旋转动画（旧 DiceCheck 兼容版）

本版本适用于以下已经确定的规则：

- 继续沿用 `BP_CoreDevice` 中原来的 `BeginCheck / DiceCheck` 逻辑；
- 三个槽位允许放入相同物品；
- 点击中央红色按钮后，先让下层大圆旋转 1.5 秒；
- 大圆停止后，才调用旧 `BeginCheck`；
- 旧 `BeginCheck` 继续负责骰子点数、IDEO 总和、阵营判断和 Reveal；
- 本步骤不再使用 `PrepareDiceCheck`、`FindPendingModuleByTag` 或 `GetFactionTagFromScore`。

> 旧的 08 文档采用“先 Prepare、后 CommitReveal”的拆分方式，与当前决定沿用旧 `BeginCheck` 的方案冲突。请按本兼容版连接。

## 1. 最终执行顺序

```text
Button_Check.OnClicked
→ 检查当前能否开始
→ 锁定按钮和槽位
→ 播放下层大圆旋转动画（1.5 秒）
→ 动画结束
→ 调用 BP_CoreDevice.BeginCheck(SubmittedItems)
→ 等待旧 BeginCheck 返回最终 Reveal 结果
```

中央按钮不能直接调用 `BeginCheck`，否则模块会在旋转动画结束前生成。

## 2. 保留和停用的旧逻辑

### 保留

保留旧 `BeginCheck` 中已经存在的内容：

- 保存 `SubmittedItems`；
- 遍历三个物品并计算 IDEO Sum；
- 调用原来的 `Dice Roll`；
- 将骰子点数与 Threshold 比较；
- 特殊三物品组合判断；
- Archivist / Whalemen Tag 判断；
- `RevealRandomModuleByTag`；
- 原有成功或失败处理。

### 停用

不要再从以下路径触发鉴定：

- Enter 键直接调用旧 `BeginCheck`；
- `PrepareDiceCheck`；
- `CommitReveal`；
- 旋转开始时调用 `BeginCheck`；
- `Delay(1.5)` 和动画结束事件同时各调用一次 `BeginCheck`。

鉴定只能有一个入口：中央 `Button_Check`。

如果仍想让 Enter 作为备用输入，Enter 只能调用与中央按钮相同的 `RequestCheck` 事件，不能直接调用 `BeginCheck`。

## 3. 在 WBP_SubmissionPanel_V2 创建变量

创建：

### `bCheckRequestActive`

- 类型：Boolean。
- 默认值：False。
- 用途：防止重复点击和重复接收动画结束回调。

### `SpinDuration`

- 类型：Float。
- 默认值：`1.5`。
- 用途：记录设计要求。UMG 动画本身仍设置为 1.5 秒。

继续使用已有变量：

- `CoreDeviceRef`；
- `SubmittedItems`；
- `SubmissionState`；
- `Button_Check`；
- `Button_Slot0`、`Button_Slot1`、`Button_Slot2`；
- `Image_OuterRing` 或实际显示下层大圆的 Image。

## 4. 修改中央按钮 OnClicked

在 `WBP_SubmissionPanel_V2` 的 Event Graph 找到：

```text
OnClicked(Button_Check)
```

连接以下顺序：

```text
OnClicked(Button_Check)
→ Branch(SubmissionState == Ready)
  False → Return
  True
    → Is Valid(CoreDeviceRef)
      Is Not Valid → Return / Print "CoreDeviceRef invalid"
      Is Valid
        → Branch(NOT bCheckRequestActive AND NOT CoreDeviceRef.bCheckInProgress)
          False → Return
          True
            → ValidateItemsForLegacyCheck
            → Branch(IsValid)
              False → 显示 FailureReason，Return
              True
                → Set bCheckRequestActive = True
                → Set CoreDeviceRef.bCheckInProgress = True
                → Set SubmissionState = Checking
                → Set Button_Check Is Enabled = False
                → Set Button_Slot0 Is Enabled = False
                → Set Button_Slot1 Is Enabled = False
                → Set Button_Slot2 Is Enabled = False
                → Play Animation(Anim_OuterRingSpin)
```

`CoreDeviceRef.bCheckInProgress` 是全局鉴定锁；`bCheckRequestActive` 是当前 Widget 的动画请求锁。两者都保留，可以避免双击和重复打开。

## 5. 创建 `ValidateItemsForLegacyCheck`

在 `WBP_SubmissionPanel_V2` 创建 Function：

`ValidateItemsForLegacyCheck`

输出：

- `IsValid`：Boolean；
- `FailureReason`：Text，可选。

节点顺序：

```text
AreAllSlotsFilled
→ Branch
  False
    → IsValid = False
    → FailureReason = "Fill all three slots"
    → Return
  True
    → SubmittedItems Length >= 3
    → Branch
      False
        → IsValid = False
        → FailureReason = "Invalid submitted items"
        → Return
      True
        → Is Valid Index(SubmittedItems, 0)
        → Is Valid Index(SubmittedItems, 1)
        → Is Valid Index(SubmittedItems, 2)
        → 三个结果 AND
        → Branch
          False → IsValid = False，Return
          True
            → 分别读取 ItemData 0、1、2
            → 检查每个 Item ID 不是 None / 空值
            → 三个结果 AND
            → 返回 IsValid = True
```

### 允许重复物品时必须删除的判断

不要添加：

```text
ID0 != ID1
ID0 != ID2
ID1 != ID2
```

也不要在这里对 `SubmittedItems` 使用 `Contains` 来拒绝相同 ID。

`A + A + A`、`A + A + B` 都是合法组合。

## 6. 创建 1.5 秒大圆旋转动画

在 Designer 中选中真正需要旋转的下层大圆 Image，例如：

`Image_OuterRing`

确认：

- Render Transform Pivot X = `0.5`；
- Render Transform Pivot Y = `0.5`；
- 该 Image 的透明素材中心与画布中心重合；
- 三个小圆和中央按钮不在这个 Image 的层级内，否则会一起旋转。

创建动画：

`Anim_OuterRingSpin`

时长：`1.5` 秒。

给 `Image_OuterRing → Transform → Angle` 添加关键帧：

```text
0.00 秒 → 0°
0.20 秒 → 30°
1.30 秒 → 690°
1.50 秒 → 720°
```

推荐：

- 使用 Auto / Cubic 插值；
- 开头速度逐渐增加；
- 结尾速度逐渐降低；
- 最终为 720°，停止后视觉方向与开始一致。

不要勾选循环播放。

## 7. 在动画结束后调用旧 BeginCheck

创建 Custom Event：

`HandleOuterRingSpinFinished`

连接：

```text
HandleOuterRingSpinFinished
→ Branch(bCheckRequestActive)
  False → Return
  True
    → Set bCheckRequestActive = False
    → Is Valid(CoreDeviceRef)
      Is Not Valid
        → ResetCheckRequestAfterFailure
      Is Valid
        → CoreDeviceRef.BeginCheck(SubmittedItems)
```

注意：要先把 `bCheckRequestActive` 设为 False，再调用 `BeginCheck`。这样即使后续回调很快返回，也不会留下错误锁定。

### 绑定动画结束事件

根据 UE 版本使用其中一种方法：

方法 A：在 Widget Graph 中添加该动画的 `On Animation Finished` 事件，然后调用 `HandleOuterRingSpinFinished`。

方法 B：在 `On Initialized` 中：

```text
Bind to Animation Finished(Anim_OuterRingSpin)
→ Event = HandleOuterRingSpinFinished
```

只绑定一次。不要同时使用 `Delay(1.5)` 再调用一次。

## 8. 创建失败恢复函数

创建 Function：

`ResetCheckRequestAfterFailure`

连接：

```text
Set bCheckRequestActive = False
→ 如果 CoreDeviceRef Valid：Set bCheckInProgress = False
→ RefreshSubmissionState
→ Set Button_Slot0 Is Enabled = True
→ Set Button_Slot1 Is Enabled = True
→ Set Button_Slot2 Is Enabled = True
```

`RefreshSubmissionState` 会根据三个槽位是否填满，决定：

- `SubmissionState = Ready`，中央按钮 Enabled；或
- `SubmissionState = Selecting`，中央按钮 Disabled。

## 9. BeginCheck 的输入连接

旧 `BeginCheck` 如果有输入参数：

`Submitted Items`

连接当前：

`WBP_SubmissionPanel_V2.SubmittedItems`

不要传 Inventory 全数组。旧 `BeginCheck` 只应该收到三个槽位当前提交的三项数据。

如果 `SubmittedItems` 保存在 `BP_CoreDevice`，也可以在播放动画前先同步一次，但必须保证最终调用 `BeginCheck` 使用的是这三个槽位的数据。

## 10. 本阶段测试

### 测试 1：未填满

- 只填 0–2 个槽位；
- 中央按钮应为 Disabled；
- 不播放旋转；
- 不调用 `BeginCheck`。

### 测试 2：三个不同物品

- 三个槽位填满；
- 点击中央按钮；
- 大圆旋转 1.5 秒；
- 停止后旧 `BeginCheck` 只调用一次。

### 测试 3：三个相同物品

- 三个槽位都选择同一个物品 A；
- 中央按钮应正常启用；
- 旋转后应进入旧 `BeginCheck`；
- 不能显示 Duplicate 或 Invalid。

### 测试 4：连续双击

- 快速双击中央按钮；
- 只能播放一次有效鉴定；
- `BeginCheck` 只能调用一次。

## 11. 与下一份文档的连接点

本步骤结束时，旧 `BeginCheck` 已经开始运行，但面板不能立即淡出。

下一份兼容版 09 将在旧 `BeginCheck` 的 Reveal 成功后发出完成回调，然后：

- 结算提交物品；
- 清空槽位；
- 播放面板淡出；
- 恢复游戏输入；
- 允许下一轮再次按 D 打开。
