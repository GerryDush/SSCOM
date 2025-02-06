const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    lintOnSave: false,
    transpileDependencies: true,
    pluginOptions: { // 经过测试，设置浅色/深色模式不能少了这几个
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                "appId": "com.lyp",
                "productName": "SSCOM",
                "copyright": "Copyright ©2022 ${author}", // 可用使用${}引用package.json里面配置项，配置项不存在会报错
                "compression": "maximum",
                "artifactName": "${productName}-${version}-${os}-${arch}.${ext}",
                "directories": {
                    "buildResources": "./public",
                    // "output": "build",
                    // "app": "./dist/electron"
                },
                "mac": {
                    category: 'public.app-category.utilities', // 应用类型
                    "target": ["dmg"],// 打包的目标类型(默认是dmg和zip),支持很多类型，具体看文档
                    'icon': 'logo.png'// 应用图标
                },
                dmg: {
                    icon: 'logo.png',
                    iconSize: 100,
                    sign: false,
                    contents: [ // mac 会有拖动图标安装的过程，这里配置图标的位置、大小、拖动的文件夹
                        {
                            x: 112,
                            y: 210,
                        },
                        {
                            type: 'link',
                            path: '/Applications',
                            x: 396,
                            y: 210,
                        },
                    ],
                }
            }
        }
    }
})
