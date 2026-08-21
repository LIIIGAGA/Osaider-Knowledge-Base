# 第 03 部分：Photoshop 红蓝噪点底图与 Unreal 导入

## 本部分目标

在 Photoshop 中完成纯黑背景与极淡红蓝噪点，导出一张完整的 16:9 UI 底图，再作为静态全屏 Texture 导入 Unreal Engine 5.6。本版本不在 Unreal 中重新生成或着色噪点。

## 1. Photoshop 画布规格

新建文档：

```text
Width = 2560 px
Height = 1440 px
Resolution = 72 或 96 ppi（屏幕使用，不影响 UE 显示尺寸）
Color Mode = RGB Color
Bit Depth = 8 bit
Color Profile = sRGB IEC61966-2.1
Background = #020204
```

推荐使用 2560 × 1440，而不是 1920 × 1080：

- 当前方案需要测试 1080p 与 1440p；
- 1440p 原尺寸显示，1080p 下缩小仍然清晰；
- 比 3840 × 2160 明显节省 UI Texture 显存；
- 细噪点不需要 4K 才能成立；
- 16:9 与 `Prototype_07` 当前主要桌面画面一致。

第一版不要同时制作多套尺寸。完成 2560 × 1440 并通过实机测试后，只有确认发布目标需要原生 4K 时，再追加 3840 × 2160 版本。

## 2. 推荐 Photoshop 图层

```text
CycleReflection_BG
├─ Adjustment_FinalContrast（可选）
├─ Grain_Fine（可选，极低强度）
├─ Noise_Blue
├─ Noise_Red
├─ Vignette（可选）
└─ BG_Black
```

`BG_Black`：

```text
Color = #020204
Opacity = 100%
```

红色建议基色：

```text
#4A1018
```

蓝色建议基色：

```text
#092844
```

不要使用纯 `#FF0000` 或纯 `#0000FF`。红蓝应像残留信号，而不是发光阵营标识。

## 3. 噪点亮度与分布

建议在 Photoshop 100% 缩放下判断强度：

```text
红色噪点层视觉强度：约 4%–8%
蓝色噪点层视觉强度：约 4%–8%
中央阅读区：约 1%–3%
```

具体 Opacity 会随混合模式变化，不要求机械地输入同一数值。最终目标是：

- 第一眼仍然接近纯黑；
- 停留后能够感到红蓝颗粒或细纹；
- 文字出现后，背景不会穿过字形造成闪烁；
- 红色与蓝色保持分离，不混成大面积紫色；
- 不形成明显人物、海浪、徽章或阵营图案。

噪点可以偏向画面外围，但不能做成左右各一半的红蓝阵营分区。

## 4. 中央文字安全区

问题和长选项将出现在中央。Photoshop 中建立一个只用于构图参考、不导出的 Guide 区域：

```text
X = 520–2040
Y = 180–1260
```

即中央约 1520 × 1080 区域。

该区域要求：

- 不出现高亮噪点团；
- 不出现清晰横线穿过文字；
- 不出现明显红蓝边界；
- 中央最核心的 1120 px 宽区域保持最低对比度；
- 不把任何文字、按钮框或 UI 元素烘焙进图片。

因为不同宽高比会裁切边缘，真正有意义的视觉细节也应保留在中央 70% 范围内。

## 5. 避免高频闪烁

如果使用 Add Noise、扫描线或很细的颗粒：

- 不要制作大量 1 px 红蓝交替棋盘格；
- 避免连续等距高对比横线；
- 适当使用 0.5–1.0 px Gaussian Blur 软化最细颗粒；
- 在 50%、75% 和 100% 缩放下检查摩尔纹；
- 同时预览缩小至 1920 × 1080 后的效果。

屏幕缩放后若出现闪烁或波纹，应先降低高频细节，而不是在 UE 中继续提高 Filter。

## 6. 导出设置

导出：

```text
File Name = T_CycleReflection_BG_2560x1440.png
Format = PNG-24
Canvas = 2560 × 1440
Convert to sRGB = On
Transparency = Off
Metadata = None 或最小
```

推荐导出不透明 PNG。黑色已经属于最终设计，不需要 Alpha；这也避免 Widget Brush 与底层颜色混合后改变红蓝强度。

保留 PSD 源文件：

```text
T_CycleReflection_BG_2560x1440_SOURCE.psd
```

PSD 不需要导入 Unreal。

## 7. 导入 Unreal

把 PNG 导入：

```text
Content/Osaider/CycleReflection/Textures
```

资产名：

```text
T_CycleReflection_BG_2560x1440
```

Texture Editor 建议：

```text
Compression Settings = UserInterface2D (RGBA)
Texture Group = UI
sRGB = true
Mip Gen Settings = NoMipmaps
Address X = Clamp
Address Y = Clamp
Never Stream = true
Filter = Default
```

保存后等待纹理处理完成，再在 Widget 中使用。

如果显存分析表明该图成本过高，优先尝试 UI 的默认压缩与 1920 × 1080 副本，不要直接降低原 PSD 的设计质量。

## 8. Widget 中的显示方式

`WBP_CycleReflection` 中使用：

```text
Border_Black
→ ScaleBox_Background
   → IMG_Background
```

`Border_Black` 始终保留为加载失败时的纯黑兜底。

`ScaleBox_Background`：

```text
Anchors = Full Screen
Offsets = 0
Stretch = Scale To Fill
Stretch Direction = Both
Clipping = Clip to Bounds
Visibility = Not Hit-Testable (Self & All Children)
```

`IMG_Background`：

```text
Brush Image = T_CycleReflection_BG_2560x1440
Color and Opacity = White
Visibility = Not Hit-Testable (Self & All Children)
```

`Scale To Fill` 允许非 16:9 屏幕裁掉边缘，同时保持画面比例。不要直接把 Image 非等比拉伸。

## 9. 出现动画

静态底图不需要 Tick，也不需要持续移动。

推荐：

```text
0.00–0.75 s：Border_Black Opacity 0 → 1
0.40–1.10 s：ScaleBox_Background Render Opacity 0 → 1
0.90–1.30 s：第一题内容 Opacity 0 → 1
```

底图出现后保持稳定。玩家的注意力应落在问题文字，而不是背景运动。

## 10. 不要让底图响应答案

禁止：

- 根据玩家答案改变红蓝强度；
- 选择某项后切换另一张阵营底图；
- 用红蓝闪烁表示答案倾向；
- 把答案索引传给 Background Image；
- 在最后决定页让一侧颜色明显增强。

底图是一张固定视觉背景，不是隐藏的评分反馈。

## 11. 本部分验收

- [ ] PSD 为 2560 × 1440、RGB 8-bit、sRGB。
- [ ] 导出 PNG 不含文字与 Alpha。
- [ ] 中央阅读安全区保持低对比度。
- [ ] 红蓝可感知但没有大面积紫色。
- [ ] 1080p 缩放后没有明显摩尔纹。
- [ ] UE Texture 使用 UI 设置并保持 sRGB。
- [ ] 非 16:9 屏幕只裁边、不拉伸变形。
- [ ] 底图不接受任何答案或阵营变量。

