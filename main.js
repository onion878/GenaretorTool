const {
    app,
    BrowserWindow,
    dialog,
    Menu,
    ipcMain
} = require('electron');
app.showExitPrompt = true;
const path = require('path');
const url = require('url');
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, loading;

function createWindow() {
    // 预加载
    loading = new BrowserWindow({
        show: false,
        frame: false,
        width: 200,
        height: 200
    });
    loading.loadURL(url.format({
        pathname: path.join(__dirname, 'static/loading/loading.html'),
        protocol: 'file:',
        slashes: true
    }));
    loading.webContents.once('dom-ready', () => {
        // 加载正式窗口
        createMainWindow();
    });
    loading.show();
    loading.setResizable(false);
}

function createMainWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        title: '代码构建工具',
        icon: path.join(__dirname, 'static/images/icon.ico')
    });
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, `static/index.html`),
        protocol: 'file:',
        slashes: true
    }));
    // mainWindow.reload();
    // Open the DevTools. debug
    //mainWindow.webContents.openDevTools();
    const menu = Menu.buildFromTemplate([{
        label: '系统',
        submenu: [{
            label: '帮助',
            click() {
                let code = `openSome({id:'welcome',title:'帮助',type:'welcome'})`;
                mainWindow.webContents.executeJavaScript(code);
            }
        },
            {
                label: '停止loading',
                click() {
                    mainWindow.webContents.executeJavaScript(`Ext.getBody().unmask()`);
                }
            },
            {
                label: '放大',
                click() {
                    mainWindow.webContents.executeJavaScript(`setZoom('+')`);
                }
            },
            {
                label: '缩小',
                click() {
                    mainWindow.webContents.executeJavaScript(`setZoom('-')`);
                }
            },
            {
                label: '重置',
                click() {
                    mainWindow.webContents.executeJavaScript(`resetZoom()`);
                }
            },
            {
                label: '重载界面',
                click() {
                    mainWindow.reload();
                }
            }
        ]
    },
        {
            label: '模板管理',
            submenu: [
                {
                    label: '本地模板',
                    click() {
                        let code = `openSome({id:'templet',title:'本地模板',type:'templet'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '模板下载',
                    click() {
                        let code = `openSome({id:'templet',title:'模板下载',type:'templet'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                }
            ]
        },
        {
            label: '控制台',
            click() {
                mainWindow.webContents.openDevTools();
            }
        },
        {
            label: 'Github',
            click() {
                require("open")('https://github.com/onion878/GenaretorTool');
            }
        }
    ]);
    Menu.setApplicationMenu(menu);

    let msgIndex = 0;

    ipcMain.on('loading-msg', (event, msg) => {
        if (msgIndex == -1) return;
        msgIndex++;
        if (loading && loading != null) {
            loading.webContents.executeJavaScript(`setMsg('${msg}', ${msgIndex})`);
        }
    });

    ipcMain.on('loading-success', (event, arg) => {
        mainWindow.show();
        if (loading && loading != null) {
            loading.hide();
            loading.close();
            loading = null;
        }
        msgIndex = -1;
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    mainWindow.on('close', function (e) {
        if (app.showExitPrompt) {
            e.preventDefault();
            dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['否', '是'],
                title: '提示',
                message: '是否退出?'
            }, function (response) {
                if (response === 1) { // Runs the following if 'Yes' is clicked
                    app.showExitPrompt = false;
                    mainWindow.close();
                    if (loading && loading != null) {
                        loading.close();
                    }
                }
            });
        }
    })
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.