"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanURLFromGoogle = exports.showRestartDialog = exports.sendChannelToAllWindows = exports.sendChannelToMainWindow = exports.setAppMenuBarVisibility = exports.getMainWindow = void 0;
const electron_1 = require("electron");
const config_1 = require("./config");
function getMainWindow() {
    return electron_1.BrowserWindow.getAllWindows()[0];
}
exports.getMainWindow = getMainWindow;
function setAppMenuBarVisibility(showTip) {
    const mainWindow = getMainWindow();
    if (mainWindow) {
        const isAppMenuBarVisible = config_1.default.get(config_1.ConfigKey.AutoHideMenuBar);
        mainWindow.setMenuBarVisibility(!isAppMenuBarVisible);
        mainWindow.autoHideMenuBar = isAppMenuBarVisible;
        if (isAppMenuBarVisible && showTip) {
            electron_1.dialog.showMessageBox({
                type: 'info',
                buttons: ['OK'],
                message: 'Tip: You can press the Alt key to see the Menu bar again.'
            });
        }
    }
}
exports.setAppMenuBarVisibility = setAppMenuBarVisibility;
function sendChannelToMainWindow(channel, ...args) {
    const mainWindow = getMainWindow();
    if (mainWindow) {
        mainWindow.webContents.send(channel, ...args);
    }
}
exports.sendChannelToMainWindow = sendChannelToMainWindow;
function sendChannelToAllWindows(channel, ...args) {
    const windows = electron_1.BrowserWindow.getAllWindows();
    for (const window of windows) {
        window.webContents.send(channel, ...args);
    }
}
exports.sendChannelToAllWindows = sendChannelToAllWindows;
async function showRestartDialog(enabled, name) {
    const state = enabled ? 'enable' : 'disable';
    const { response } = await electron_1.dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Cancel'],
        message: 'Restart required',
        detail: typeof enabled === 'boolean' && name
            ? `To ${state} ${name}, please restart ${electron_1.app.name}`
            : 'A restart is required to apply the settings'
    });
    // If restart was clicked (index of 0), restart the app
    if (response === 0) {
        electron_1.app.relaunch();
        electron_1.app.quit();
    }
}
exports.showRestartDialog = showRestartDialog;
function cleanURLFromGoogle(url) {
    var _a;
    if (!url.includes('google.com/url')) {
        return url;
    }
    return (_a = new URL(url).searchParams.get('q')) !== null && _a !== void 0 ? _a : url;
}
exports.cleanURLFromGoogle = cleanURLFromGoogle;
