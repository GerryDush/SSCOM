'use strict'

import {app, protocol, BrowserWindow, ipcMain, nativeTheme} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS3_DEVTOOLS} from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}])
let win;
ipcMain.handle('dark-mode:set', (event, theme) => {
    nativeTheme.themeSource = theme;
})

ipcMain.handle('dark-mode:get', () => {
    return nativeTheme.shouldUseDarkColors;
})
nativeTheme.on('updated', () => {
    win.webContents.send('dark-mode:updated', nativeTheme.shouldUseDarkColors);
    win.setVibrancy(nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
});


if (process.platform === 'darwin') {
    // app.dock.setIcon(__static + '/logo.png');
}

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        titleBarStyle: 'hiddenInset',
        frame: false,
        vibrancy: 'dark',
        visualEffectState: "active", // 这个参数不加的话，鼠标离开应用程序其背景就会变成白色
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone      // 经过测试，设置浅色/深色模式不能少了这两个
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
    })


    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (process.env.IS_TEST) win.webContents.openDevTools()
        win.webContents.openDevTools();
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
        // win.webContents.openDevTools();
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS3_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    await createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
