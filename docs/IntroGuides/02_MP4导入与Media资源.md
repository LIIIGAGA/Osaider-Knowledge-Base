# 第 02 部分：MP4 导入与 Media 资源

## 本部分目标

创建 `FMS_Intro_Default`、`MP_Intro` 和 `MT_Intro`，并在 Media Player 编辑器中确认 MP4 能独立播放。先验证媒体链路，再开始制作 UMG。

## 1. 创建 File Media Source

在：

```text
Content/Osaider/Intro/Media
```

右键空白处：

```text
Media → File Media Source
```

命名：

```text
FMS_Intro_Default
```

打开后，在 File Path 中选择：

```text
Content/Movies/Intro/Osaider_Intro_Loop.mp4
```

检查：

- 路径不应显示“文件不在 Content/Movies 中”的黄色警告；
- 第一版关闭 `Precache File`；
- Player Overrides 先保持自动选择；
- 不要在开发电脑上留下只对当前机器有效的绝对路径。

## 2. 创建 Media Player 与 Media Texture

在同一目录右键：

```text
Media → Media Player
```

弹出创建窗口后勾选：

```text
Video output Media Texture asset
```

创建后重命名：

```text
Media Player  = MP_Intro
Media Texture = MT_Intro
```

打开 `MT_Intro`，确认它的 Media Player 指向：

```text
MP_Intro
```

## 3. 在 Media Player 编辑器中测试

双击打开 `MP_Intro`。

在 Media Library 中双击：

```text
FMS_Intro_Default
```

检查：

- 视频是否出现；
- 播放速度是否正常；
- 总时长是否正确；
- 拖动播放位置是否可用；
- 是否能暂停和重新播放；
- 视频是否存在明显损坏帧。

这一步失败时，不要继续制作 Widget。先解决视频编码、文件路径或播放器插件问题。

## 4. Media Player 设置

第一版建议：

- `Play on Open` 可以关闭，后续由 Blueprint 明确控制播放；
- Loop 不依赖编辑器按钮状态，后续在 `OnMediaOpened` 中执行 `Set Looping(true)`；
- Shuffle 关闭；
- Playlist 不需要；
- View Settings 只影响编辑器预览，不作为游戏逻辑。

显式 Blueprint 控制比依赖 Media Player 编辑器上次保存的播放状态更容易排错。

## 5. 检查 Media Texture

播放 `MP_Intro` 时打开 `MT_Intro`。

应看到相同视频画面。如果 Media Player 有画面而 Media Texture 全黑：

1. 检查 `MT_Intro.Media Player` 是否为 `MP_Intro`；
2. 保存两个资产；
3. 关闭并重新打开 Media Player；
4. 确认创建 Media Player 时生成的是当前使用的 Media Texture，而不是旧的测试资产。

## 6. 可选：创建视频音频 Actor

如果 MP4 自带声音，在：

```text
Content/Osaider/Intro/Blueprints
```

创建 Actor Blueprint：

```text
BP_IntroMediaAudio
```

组件：

```text
DefaultSceneRoot
└─ MediaSound
```

选中 `MediaSound`：

```text
Media Player = MP_Intro
```

其他设置先保持默认。第 03 部分把这个 Actor 放入 `L_Intro`。

如果视频静音，不需要创建该 Blueprint。

## 7. 保存与引用检查

保存以下资产：

```text
FMS_Intro_Default
MP_Intro
MT_Intro
BP_IntroMediaAudio（如果使用）
```

建议右键 `FMS_Intro_Default` 使用 Reference Viewer，确认：

- `MP_Intro` 或后续 Widget 会引用它；
- 没有引用旧测试视频；
- 媒体文件路径正确。

## 8. 本部分验收

- [ ] `FMS_Intro_Default` 指向 `Content/Movies/Intro` 中的 MP4。
- [ ] `MP_Intro` 已创建。
- [ ] `MT_Intro` 已创建并绑定 `MP_Intro`。
- [ ] Media Player 编辑器中可以播放完整视频。
- [ ] Media Texture 中能看到相同画面。
- [ ] 已决定是否使用 `BP_IntroMediaAudio`。
- [ ] 所有 Media 资产已保存。

## 常见错误

### MP4 在系统播放器能播，但 Unreal 中黑屏

优先重新导出为标准 H.264、8-bit、YUV 4:2:0、恒定 30fps。不要第一版使用 H.265、10-bit HDR 或可变帧率素材。

### 文件路径旁边有黄色警告

通常表示文件不在 `Content/Movies`。重新选择 Movies 文件夹内的副本，不要继续引用 Downloads 或桌面上的原文件。

### 视频有画面但没有声音

Media Texture 只输出画面。需要把绑定 `MP_Intro` 的 Media Sound Component 放入关卡。

