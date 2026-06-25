# Osaider 原型关卡核查总结
*生成日期：2026-06-25*

---

## 一、整体概况

项目共有 8 张 Prototype 关卡，均位于 `Content/LEL/`。
**当前活跃关卡（EditorStartupMap + GameDefaultMap）：`Prototype_06_2`**
其余 7 张均不在任何配置加载路径中，运行时不会被加载。

---

## 二、关卡分代概览

8 张关卡可分为两个明显的开发世代：

### 第一代：室内小场景原型（Prototype_01、Prototype_02）

- **场景规模**：小型室内空间，坐标在 -6000～1500 范围内
- **交互系统**：基于 BP_TopDownCharacter 时代的近身交互逻辑
  - 包含 BP_ZoomInteractable（相机缩放触发器）
  - 包含 BP_ItemSocket（道具插槽）
  - 包含 BP_DoorMover、BP_CoreDevice
- **注**：BP_TopDownCharacter 已废弃，上述蓝图中的相关死代码已于 2026-06-25 清理完毕

### 第二代：大尺度空间布局原型（Prototype_03～06_2）

- **场景规模**：模块分布坐标在 4000～30000 范围，空间尺度大幅扩展
- **模块命名规范**：新命名 `BP_Module_NEW_Archivist_XX` / `BP_Module_Whalemen_XX`
- **导航方式**：CameraActor + BP_CameraSplinePath（相机路径动画），无可控角色
- **无** BP_ZoomInteractable、BP_ItemSocket、BP_InteractCube 实例
- **InteractionPoint** 以大 scale（100 倍+，部分非均匀）放置，适配大场景

---

## 三、各关卡详细内容

### Prototype_01

| 项目 | 内容 |
|---|---|
| 场景类型 | 室内小空间 |
| Archivist 模块 | 无（使用旧系统）|
| Whalemen 模块 | 无 |
| 交互 BP | BP_ZoomInteractable ×1、BP_ItemSocket ×3、BP_CoreDevice ×1 |
| 辅助 BP | BP_DoorMover ×2、BP_InteractionPoint ×7 |
| 相机系统 | 无 CameraSplinePath |
| 特点 | 最早的室内原型，验证基础交互流程（ZoomIn/Out + ItemSocket + DoorMover）|

---

### Prototype_02

| 项目 | 内容 |
|---|---|
| 场景类型 | 室内空间（与 01 同场景，扩展内容）|
| Archivist 模块 | 旧命名：BP_LibraryModule + BP_Storylet01~05（5 个叙事节点）|
| Whalemen 模块 | 旧命名：BP_AssemblyLineModule、BP_TheatreModule、BP_GenerationMachineModule、BP_MemorialHallModule |
| 交互 BP | BP_ZoomInteractable ×1、BP_ItemSocket ×6（旧命名 3 + 新命名 3）|
| 辅助 BP | BP_DoorMover ×4、BP_InteractionPoint ×12（旧 7 + 新 5）、BP_CoreDevice ×2、BP_ModuleAssembler ×1 |
| 相机系统 | 无 CameraSplinePath |
| 特点 | **内容最丰富的室内原型**，首次引入 Storylet 叙事系统和游戏内容模块（LibraryModule / AssemblyLineModule 等旧命名），并出现新命名 Actor 实例（_GEN_VARIABLE_ 前缀，由 BP_ModuleAssembler 生成），新旧两套命名规范并存 |

---

### Prototype_03

| 项目 | 内容 |
|---|---|
| 场景类型 | 大尺度三维空间 |
| Archivist 模块 | BP_Module_NEW_Archivist_01 ×2、02~06 各 ×1（共 7 个）|
| Whalemen 模块 | BP_Module_Whalemen_01 ×2、02~03 各 ×1（共 4 个）|
| 交互 BP | BP_InteractionPoint ×7（scale=100）|
| 相机系统 | CameraActor（无 CameraSplinePath）|
| 特点 | **首张大尺度空间原型**，正式启用新模块命名规范。Archivist_01 有两个实例，其中一个坐标异常（y≈-47700，疑似误操作移位）。无旧系统遗留 |

---

### Prototype_04

| 项目 | 内容 |
|---|---|
| 场景类型 | 大尺度三维空间 |
| Archivist 模块 | BP_Module_NEW_Archivist_01~06 各 ×1（共 6 个）|
| Whalemen 模块 | BP_Module_Whalemen_01~03 各 ×1（共 3 个）|
| 交互 BP | BP_InteractionPoint ×10（各种非均匀 scale，实验性摆放）|
| 相机系统 | CameraActor + **BP_CameraSplinePath**（首次加入）|
| 特点 | 在 03 基础上完善：修正 Archivist_01 异常坐标，加入相机路径动画系统，InteractionPoint 数量增至 10 且开始探索非均匀缩放 |

---

### Prototype_04_2（测试用）

| 项目 | 内容 |
|---|---|
| 场景类型 | 大尺度三维空间（基于 04 复制）|
| Archivist 模块 | BP_Module_NEW_Archivist_01~05 各 ×1（**缺 Archivist_06**）|
| Whalemen 模块 | **无**（全部缺失）|
| 交互 BP | BP_InteractionPoint ×7（少于 04 的 10 个）|
| 相机系统 | CameraActor + BP_CameraSplinePath |
| 特点 | 04 的局部删减测试版本，移除了 Whalemen 模块和 Archivist_06，Archivist_04 位置也有变动（x=-8856 vs 04 的 x=5903）。Level Blueprint 命名存在错误（Actor 名为 Prototype_06_C_1，class 为 Prototype_04_2_C）|

---

### Prototype_05（测试用）

| 项目 | 内容 |
|---|---|
| 场景类型 | 大尺度三维空间（极度稀疏）|
| Archivist 模块 | BP_Module_NEW_Archivist_02 ×1、03 ×1（**仅 2 个**）|
| Whalemen 模块 | **无** |
| 交互 BP | BP_InteractionPoint ×2 |
| 相机系统 | CameraActor + BP_CameraSplinePath |
| 特点 | 只保留 2 个 Archivist 模块和 2 个 InteractionPoint 的最精简测试状态，可能用于单独测试特定模块行为 |

---

### Prototype_06

| 项目 | 内容 |
|---|---|
| 场景类型 | 大尺度三维空间 |
| Archivist 模块 | BP_Module_NEW_Archivist_01~06 各 ×1（与 04 完全相同）|
| Whalemen 模块 | BP_Module_Whalemen_01~03 各 ×1（与 04 完全相同）|
| 交互 BP | BP_InteractionPoint ×10（与 04 完全相同）|
| 相机系统 | CameraActor + BP_CameraSplinePath（与 04 相同）|
| 辅助 BP | **BP_CoreDevice ×1**（比 04 新增，位于场景中心附近）|
| 特点 | Prototype_04 的直接延伸，唯一新增是 BP_CoreDevice，是当前活跃关卡 Prototype_06_2 的直接前身 |

---

### Prototype_06_2（★ 当前活跃关卡）

| 项目 | 内容 |
|---|---|
| 场景类型 | 大尺度三维空间 |
| Archivist 模块 | BP_Module_NEW_Archivist_01~06 各 ×1（与 06 完全相同）|
| Whalemen 模块 | BP_Module_Whalemen_01~03 各 ×1（与 06 完全相同）|
| 交互 BP | BP_InteractionPoint ×8（比 06 少 2 个，部分位置调整）|
| 相机系统 | CameraActor + BP_CameraSplinePath |
| 辅助 BP | BP_CoreDevice ×1（scale=100，与 06 相同位置）|
| 特点 | 在 06 基础上精简 InteractionPoint（从 10 减至 8，删去了两个极端非均匀 scale 的实验性点位，如 scale 50/100/300），并微调部分点位坐标和 scale。模块布局与 06 完全一致。Level Blueprint 存在同类命名问题（Actor 名为 Prototype_07_C_1，class 为 Prototype_06_2_C）|

---

## 四、演进脉络对比

```
Prototype_01
    ↓ 加入 Storylet + Module 系统（旧命名）
Prototype_02
    ↓ 切换到大尺度场景 + 新模块命名规范
Prototype_03
    ↓ 修正异常坐标 + 加入 CameraSplinePath
Prototype_04 ──→ Prototype_04_2（测试：减少模块）
    ↓              Prototype_05（测试：最小化）
    ↓ 加入 BP_CoreDevice
Prototype_06
    ↓ 精简 InteractionPoint（10→8），微调点位
Prototype_06_2  ← ★ 当前活跃关卡
```

---

## 五、各关卡核心差异速查表

| 关卡 | 场景规模 | Archivist 模块数 | Whalemen 模块数 | CameraSpline | BP_CoreDevice | InteractionPoint 数 | 旧系统 |
|---|---|---|---|---|---|---|---|
| Prototype_01 | 室内小 | 0（旧）| 0 | ✗ | ✓ | 7 | ✓ |
| Prototype_02 | 室内小 | 0（旧）| 0（旧）| ✗ | ✓ | 12 | ✓ |
| Prototype_03 | 大尺度 | 7（含重复）| 4（含重复）| ✗ | ✗ | 7 | ✗ |
| Prototype_04 | 大尺度 | 6 | 3 | ✓ | ✗ | 10 | ✗ |
| Prototype_04_2 | 大尺度 | 5 | 0 | ✓ | ✗ | 7 | ✗ |
| Prototype_05 | 大尺度 | 2 | 0 | ✓ | ✗ | 2 | ✗ |
| Prototype_06 | 大尺度 | 6 | 3 | ✓ | ✓ | 10 | ✗ |
| **Prototype_06_2** ★ | **大尺度** | **6** | **3** | **✓** | **✓** | **8** | **✗** |
