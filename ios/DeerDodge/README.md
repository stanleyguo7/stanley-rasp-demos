# 小鹿闪闪 iOS App

这是网页游戏的离线 iPhone 版本。Xcode 项目把 `demos/deer-dodge/` 作为本地资源打包进 App，游戏运行时不需要网络连接。网页游戏更新后，重新构建 App 即可包含新版本。

## 在 iPhone 上运行

1. 在 Mac 上安装 Xcode，打开 `ios/DeerDodge/DeerDodge.xcodeproj`。
2. 在 Xcode 的 **Signing & Capabilities** 中选择自己的 Apple 开发团队；如 Bundle Identifier 被占用，可改成自己的唯一标识。
3. 连接 iPhone，在 Xcode 顶部选择设备，然后点击 **Run**。

最低支持 iOS 16，当前仅支持竖屏。音效使用设备扬声器，游戏内可通过喇叭按钮静音。

如需重新生成 Xcode 项目，在本目录运行 `xcodegen generate`。仓库同时保留了已生成的 `.xcodeproj`，普通使用不需要安装 XcodeGen。
