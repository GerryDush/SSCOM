# 专门为 Mac OS 打造的串口调试助手
<img src="https://s1.ax1x.com/2022/12/09/zRmYUs.png" width="100" height="100"/>

基于：`Javascript`、`Electron`、`Vue3`、`Vue-cli 5`

macOS 的串口调试助手，有开源的，也有免费的，但都多多少少让人有点用着不爽，据我使用过的一些支持macOS的串口调试助手来看，它们存在一些令我难以接受的问题：
1. 界面不太美观（不符合我的审美～）
2. 界面不太直观
3. 在某些情况下有bug，比如：中文乱码、数据丢失（不太敢保证我的不会～）


由于以上原因我创建了本项目，但由于精力有限，一些有趣的功能（如：软件示波器）暂时没时间搞，目前只支持一些基本的串口调试功能，所以希望能有更多人参与进来一起改进、增加一些更加炫酷的功能。

- 🌈 支持 `AppleSilicon`、`Intel` 芯片的Mac（由于本项目刚开始只为解决自己的问题而创建，对 Electron 了解的并不多，代码质量好像不太好，命名也不太对）
- 🔥 支持 浅色模式/黑暗模式/自动切换
- 🌏 支持 `ASCII` / `HEX` / `UTF-8` / `GBK` 实时切换
- ⏰ 支持 时间实时显示
- ⭐️ 支持 行号实时显示
- ✨ 支持 点击 HEX 显示对应的 `二进制` / `八进制` / `十进制`

## 计划
- 软件示波器
- TCP/UDP 网络调试、WebSocket 调试
- 还没想到...
- Swift 重写

## 目前效果
![zRm1KS.png](https://s1.ax1x.com/2022/12/09/zRm1KS.png)
![zRm3Dg.png](https://s1.ax1x.com/2022/12/09/zRm3Dg.png)
![zRm8bQ.png](https://s1.ax1x.com/2022/12/09/zRm8bQ.png)
![zRniin.png](https://s1.ax1x.com/2022/12/09/zRniin.png)
![zRnFGq.png](https://s1.ax1x.com/2022/12/09/zRnFGq.png)



## Project setup
```
yarn install
```

### 运行
```
yarn run electron:serve:native
```

### 构建一个当前平台的应用
```
yarn run electron:build:native
```


### 跨平台构建
#### x64
```
yarn run package:mac:arm64
```
### arm64
```
yarn run package:mac:x64
```
### windows/linux
能构建，但不一定能使用，因为没有针对mac以外的平台适配


### Lints and fixes files
```
yarn lint
```
