"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const electron_1 = require("electron");
const electron_util_1 = require("electron-util");
const config_1 = require("./config");
const custom_styles_1 = require("./custom-styles");
const debug_1 = require("./debug");
const downloads_1 = require("./downloads");
const helpers_1 = require("./helpers");
const menu_1 = require("./menu");
const utils_1 = require("./utils");
const electronContextMenu = require("electron-context-menu");
const jsonfile = require("jsonfile");
debug_1.init();
downloads_1.init();
const pkgJSON = jsonfile.readFileSync(path.join(__dirname, '..', 'package.json'));
electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true });
if (!config_1.default.get(config_1.ConfigKey.HardwareAcceleration)) {
    electron_1.app.disableHardwareAcceleration();
}
const shouldStartMinimized = electron_1.app.commandLine.hasSwitch('launch-minimized') ||
    config_1.default.get(config_1.ConfigKey.LaunchMinimized);
electron_1.app.setAppUserModelId(pkgJSON.appId);
let mainWindow;
if (!electron_1.app.requestSingleInstanceLock()) {
    electron_1.app.quit();
}
electron_1.app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
    }
});
switch (config_1.default.get(config_1.ConfigKey.DarkMode)) {
    case 'system':
        electron_1.nativeTheme.themeSource = 'system';
        break;
    case true:
        electron_1.nativeTheme.themeSource = 'dark';
        break;
    default:
        electron_1.nativeTheme.themeSource = 'light';
}
function createWindow() {
    const lastWindowState = config_1.default.get(config_1.ConfigKey.LastWindowState);
    mainWindow = new electron_1.BrowserWindow({
        title: electron_1.app.name,
        titleBarStyle: 'default',
        // TitleBarStyle: config.get(ConfigKey.CompactHeader)
        // ? 'hiddenInset'
        // : 'default',
        // hidden frame and title bar https://www.electronjs.org/zh/docs/latest/api/frameless-window
        // titleBarStyle: 'hidden',
        frame: true,
        minWidth: 780,
        width: lastWindowState.bounds.width,
        minHeight: 200,
        height: lastWindowState.bounds.height,
        x: lastWindowState.bounds.x,
        y: lastWindowState.bounds.y,
        webPreferences: {
            nodeIntegration: false
        },
        show: !shouldStartMinimized,
        icon: electron_util_1.is.linux
            ? path.join(__dirname, '..', 'static', 'icon.png')
            : undefined,
        darkTheme: electron_1.nativeTheme.shouldUseDarkColors
    });
    // MainWindow.setFullScreen(true);
    // if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
    //   mainWindow.setFullScreen(lastWindowState.fullscreen)
    // }
    mainWindow.maximize();
    // If (lastWindowState.maximized && !mainWindow.isMaximized()) {
    //   mainWindow.maximize()
    // }
    if (electron_util_1.is.linux || electron_util_1.is.windows) {
        utils_1.setAppMenuBarVisibility();
    }
    mainWindow.loadURL(config_1.default.get(config_1.ConfigKey.AppUrl));
    mainWindow.on('app-command', (_event, command) => {
        if (command === 'browser-backward' && mainWindow.webContents.canGoBack()) {
            mainWindow.webContents.goBack();
        }
        else if (command === 'browser-forward' &&
            mainWindow.webContents.canGoForward()) {
            mainWindow.webContents.goForward();
        }
    });
    mainWindow.webContents.on('dom-ready', () => {
        addCustomCSS(mainWindow);
        custom_styles_1.init();
    });
    mainWindow.webContents.on('did-finish-load', async () => {
    });
    mainWindow.webContents.on('new-window', newEvent => {
        console.log("Blocked by 'new-window'");
        newEvent.preventDefault();
    });
    mainWindow.webContents.on('will-navigate', (newEvent, url) => {
        console.log("Handled by 'will-navigate' " + url);
        if (!url.includes(pkgJSON.allowedInternalUrlDomain)) {
            newEvent.preventDefault();
            setImmediate(() => {
                openExternalUrl(url);
            });
            return;
        }
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        console.log("[setWindowOpenHandler] " + url);
        if (!url.includes(pkgJSON.allowedInternalUrlDomain)) {
            console.log("Blocked by 'setWindowOpenHandler'");
            setImmediate(() => {
                openExternalUrl(url);
            });
            return { action: 'deny' };
        }
        else {
            return { action: 'allow' };
        }
    });
}
function addCustomCSS(windowElement) {
    windowElement.webContents.insertCSS(fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8'));
    if (fs.existsSync(custom_styles_1.USER_CUSTOM_STYLE_PATH)) {
        windowElement.webContents.insertCSS(fs.readFileSync(custom_styles_1.USER_CUSTOM_STYLE_PATH, 'utf8'));
    }
    const platformCSSFile = path.join(__dirname, '..', 'css', `style.${helpers_1.platform}.css`);
    if (fs.existsSync(platformCSSFile)) {
        windowElement.webContents.insertCSS(fs.readFileSync(platformCSSFile, 'utf8'));
    }
}
async function openExternalUrl(url) {
    const cleanURL = url;
    if (config_1.default.get(config_1.ConfigKey.ConfirmExternalLinks)) {
        const { origin } = new URL(cleanURL);
        const trustedHosts = config_1.default.get(config_1.ConfigKey.TrustedHosts);
        if (!trustedHosts.includes(origin)) {
            const { response, checkboxChecked } = await electron_1.dialog.showMessageBox({
                type: 'info',
                buttons: ['Open Link', 'Cancel'],
                message: `Do you want to open this external link in your default browser?`,
                checkboxLabel: `Trust all links on ${origin}`,
                detail: cleanURL
            });
            if (response !== 0)
                return;
            if (checkboxChecked) {
                config_1.default.set(config_1.ConfigKey.TrustedHosts, [...trustedHosts, origin]);
            }
        }
    }
    electron_1.shell.openExternal(cleanURL);
}
electron_1.app.on('activate', () => {
    if (mainWindow) {
        mainWindow.show();
    }
});
electron_1.app.on('before-quit', () => {
    if (mainWindow) {
        config_1.default.set(config_1.ConfigKey.LastWindowState, {
            bounds: mainWindow.getBounds(),
            fullscreen: mainWindow.isFullScreen(),
            maximized: mainWindow.isMaximized()
        });
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    }
});
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
(async () => {
    await Promise.all([electron_1.app.whenReady()]);
    const customUserAgent = config_1.default.get(config_1.ConfigKey.CustomUserAgent);
    if (customUserAgent) {
        electron_1.app.userAgentFallback = customUserAgent;
    }
    createWindow();
    menu_1.initOrUpdateMenu();
    const { webContents } = mainWindow;
    webContents.on('dom-ready', () => {
        if (!shouldStartMinimized) {
            mainWindow.show();
        }
    });
    if (config_1.default.get(config_1.ConfigKey.DarkMode) === undefined) {
        const { response } = await electron_1.dialog.showMessageBox({
            type: 'info',
            message: `${electron_1.app.name} (now) has dark mode! Do you want to enable it?`,
            detail: 'It\'s recommended to set the Gmail theme to "Default" in order for dark mode to work properly.',
            buttons: ['Yes', 'No', 'Follow System Appearance', 'Ask Again Later']
        });
        if (response === 0) {
            electron_1.nativeTheme.themeSource = 'dark';
            config_1.default.set(config_1.ConfigKey.DarkMode, true);
            menu_1.initOrUpdateMenu();
        }
        else if (response === 1) {
            electron_1.nativeTheme.themeSource = 'light';
            config_1.default.set(config_1.ConfigKey.DarkMode, false);
            menu_1.initOrUpdateMenu();
        }
        else if (response === 2) {
            electron_1.nativeTheme.themeSource = 'system';
            config_1.default.set(config_1.ConfigKey.DarkMode, 'system');
            menu_1.initOrUpdateMenu();
        }
    }
})();
