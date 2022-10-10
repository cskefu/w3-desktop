"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.setCustomStyle = exports.USER_CUSTOM_STYLE_PATH = void 0;
const electron_1 = require("electron");
const path = require("path");
const config_1 = require("./config");
const utils_1 = require("./utils");
exports.USER_CUSTOM_STYLE_PATH = path.join(electron_1.app.getPath('userData'), 'custom.css');
function setCustomStyle(key, enabled) {
    utils_1.sendChannelToMainWindow('set-custom-style', key, enabled);
}
exports.setCustomStyle = setCustomStyle;
function initFullScreenStyles() {
    const mainWindow = utils_1.getMainWindow();
    if (mainWindow) {
        mainWindow.on('enter-full-screen', () => {
            utils_1.sendChannelToMainWindow('set-full-screen', true);
        });
        mainWindow.on('leave-full-screen', () => {
            utils_1.sendChannelToMainWindow('set-full-screen', false);
        });
    }
}
function init() {
    for (const key of [
        config_1.ConfigKey.CompactHeader,
        config_1.ConfigKey.HideFooter,
        config_1.ConfigKey.HideSupport
    ])
        setCustomStyle(key, config_1.default.get(key));
    initFullScreenStyles();
}
exports.init = init;
