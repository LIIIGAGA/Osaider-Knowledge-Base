# 第 09 部分：`CommitPendingReveal`、模块显示与界面淡出

## 本部分目标

实现严格时序：

```text
外圈旋转结束
→ CommitPendingReveal
→ 模块成功 Reveal
→ Submission 面板淡出
→ 恢复游戏输入
```

## 1. 创建 `CommitPendingReveal`

在 `BP_CoreDevice` 新建 Function：

`CommitPendingReveal`

输出：

- `Success`：Boolean。
- `FailureReason`：Text 可选。

## 2. 验证 Pending Module

函数开始：

```text
Branch(bCheckInProgress)
False → Failure "No check in progress" → Return False
True
  → Is Valid(PendingRevealModule)
  → Branch
    False → Failure "Pending module invalid" → 安全重置 → Return False
```

不要在无效引用上继续调用 Interface。

## 3. 优先使用 `BPI_SpawnReveal`

当前项目部分模块已经实现：

- `RevealModuleGroup`
- `HideModuleGroup`
- `SetAlreadyRevealed`

推荐流程：

```text
Does Implement Interface(BPI_SpawnReveal)
→ Branch
  True
    → RevealModuleGroup (Message) on PendingRevealModule
    → SetAlreadyRevealed (Message) = True（按接口实际签名）
  False
    → 使用当前旧模块 Reveal 方法
```

注意：接口 Message 的 Target 必须是 `PendingRevealModule`。

## 4. 旧模块的兼容 Reveal

如果某个模块尚未实现 `BPI_SpawnReveal`，临时兼容：

```text
Set Actor Hidden In Game(False)
→ Set Actor Enable Collision(True)
→ Set Actor Tick Enabled(True)（如果模块需要）
```

但如果模块还拥有 `OwnedInteractionPoints`，仅 Unhide 主 Actor 不够。因此优先补齐 `BPI_SpawnReveal`，不要长期依赖兼容分支。

## 5. 登记已显示模块

Reveal 调用后：

```text
SpawnedModules Add Unique(PendingRevealModule)
```

如果 `SpawnedModules` 名称不同，使用当前实际数组。

这样下一轮 `FindPendingModuleByTag` 会排除它。

## 6. 清理 Pending 数据

成功 Reveal 后：

1. 保存一个 Local `RevealedModule`（如果后续事件需要传出）。
2. Set `PendingRevealModule = None`。
3. Clear `PendingFactionTag`。
4. 清空 Pending Roll/Score 临时值，或保留到结果 UI 完成。

## 7. 清理 Submitted Items

复用旧 `BeginCheck` 最后已经验证过的清理逻辑。

不要重新发明物品生命周期。

旧流程如果：

- 上缴后从 Inventory 消耗物品 → 继续执行；
- 只清空 Submission、不从 Inventory 删除 → 继续保持；
- 特殊物品有例外 → 保留例外。

清理至少包括：

- 三个 `SubmittedItems` 设回空；
- `IdeologySum` 归零；
- 临时骰子变量按旧规则重置。

## 8. 完成 CoreDevice 状态

```text
Set bCheckInProgress = False
→ RefreshSubmissionAvailability
→ Broadcast OnModuleRevealCommitted(RevealedModule 可选)
→ Success True
```

`RefreshSubmissionAvailability` 会根据剩余 Inventory 和游戏条件决定后续是否再次可用。

这里绝对不要修改：

- `SubmissionTutorialState`；
- `TriggeredInitialModules`；
- 初始模块的 `bHasReportedInitialTrigger`。

首次流程走到鉴定时，玩家已经通过 D 键或右上角红色图标成功打开过面板，因此教学状态应该已经是 `Completed`。Commit 只完成本轮鉴定，不重开首次教学。

## 9. 处理 Commit 失败

如果 Pending Actor 在动画期间失效：

1. `PendingRevealModule = None`。
2. `bCheckInProgress = False`。
3. 不清空 `SubmittedItems`。
4. 返回 False。
5. Widget 恢复到 Ready。

不要因为 Reveal 失败而吞掉玩家物品。

## 10. 在 Widget 连接动画 Finished

回到 `WBP_SubmissionPanel.HandleCheckAnimationFinished`。

替换临时 Print：

```text
HandleCheckAnimationFinished
→ CoreDeviceRef.CommitPendingReveal
→ Branch(Success)
  True
    → Play Animation(Anim_PanelFadeOut)
  False
    → Set SubmissionState = Ready
    → Set 三个 Slot Button Enabled True
    → RefreshSubmissionState
    → 显示 FailureReason
```

## 11. 创建 `Anim_PanelFadeOut`

Animations 新建：

`Anim_PanelFadeOut`

建议时长：0.4 秒。

给 `Canvas_Root` 添加 Render Opacity：

```text
0.00 s → 1.00
0.40 s → 0.00
```

使用 Ease Out。

可选 Scale：

```text
0.00 s → 1.000
0.40 s → 0.985
```

不要在 Reveal 成功前播放这个动画。

## 12. 绑定淡出完成

为 `Anim_PanelFadeOut` 绑定 Finished：

创建：

`HandlePanelFadeOutFinished`

节点：

```text
Set SubmissionState = Closed
→ PlayerControllerRef.CloseSubmissionPanel
```

根据你的复用策略：

### 每次重新创建 Widget

- `Remove From Parent`；
- PlayerController 清空 `SubmissionPanelRef`。

### 保留同一个 Widget

- Set Visibility Collapsed；
- 下次打开前把 Render Opacity 设回 1；
- 需要手动重置动画和状态。

第一版建议 Remove，再确保单实例创建逻辑正确。

## 13. 恢复输入

`PlayerController.CloseSubmissionPanel` 必须：

```text
Set Input Mode Game Only
→ Set bUIInteractionLocked = False
→ 恢复鼠标状态
→ 恢复 HoverTrace / Drag / Camera
```

不要直接在 Widget 中复制一套输入恢复逻辑，统一由 PlayerController 管理。

## 14. 测试严格时序

加入时间 Print：

```text
中央点击：PREPARED
动画结束：ROTATION FINISHED
Commit：REVEAL COMMITTED
淡出结束：PANEL CLOSED
```

观察顺序必须完全一致。

### 场景视觉检查

1. 点击中央按钮。
2. 旋转进行到一半时暂停 PIE。
3. `PendingRevealModule` 应有效。
4. 目标 Actor 仍 Hidden。
5. 继续播放。
6. 1.5 秒结束后 Actor 才出现。
7. Actor 出现后面板才淡出。

## 15. 检查模块完整 Reveal

新模块出现后检查：

- 主 Actor 可见；
- Collision 正确；
- Tick 正确；
- `OwnedInteractionPoints` 可见且可点击；
- InteractionPoint 的 `OwningModuleRef` 正确；
- CameraSpline 和模块交互正常。

如果主模型可见但无法交互，通常是只执行了 `SetActorHiddenInGame(false)`，没有走完整 `RevealModuleGroup`。

## 16. 常见错误

### 模块在旋转开始时就出现

- Reveal 节点仍在 Prepare；
- 旧 Enter/BeginCheck 路径仍在执行；
- Widget 点击同时调用了 Prepare 和旧 BeginCheck。

### 新模块出现后又弹出首次教学

- 检查新模块的 `bCountsTowardInitialUnlock` Class Default 是否错误为 True；
- 检查是否把 `NotifyInitialModuleTriggered` 接进了 `RevealModuleGroup`；
- 检查 Commit/Reset 是否把 `SubmissionTutorialState` 改回 Collecting；
- 正确的 Commit 只 Reveal 模块并刷新普通 Availability，不触发教学状态转换。

### 动画结束后没有模块

- Finished 事件未绑定；
- 绑定到了错误动画；
- Pending Actor 无效；
- Interface Target 错误；
- Tag 筛选没有候选。

### 模块出现但面板不消失

- Commit 没有返回 True；
- Fade 动画没有 Play；
- Fade Finished 没有调用 Close。

### 面板消失后游戏仍无法操作

- PlayerController 没恢复 Game Only；
- `bUIInteractionLocked` 仍为 True。

## 17. 本部分验收

- [ ] Animation Finished 才调用 Commit。
- [ ] Commit 优先使用完整 `BPI_SpawnReveal`。
- [ ] Reveal 后登记到 SpawnedModules。
- [ ] Reveal 成功后才清理上缴数据。
- [ ] Reveal 失败保留物品。
- [ ] 模块出现后面板淡出。
- [ ] 淡出结束后游戏输入完全恢复。
- [ ] Commit 不清空初始模块记录，也不重置全局教学状态。
- [ ] Commit 不关心面板是通过 D 键还是右上角图标打开的。
