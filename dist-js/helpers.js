"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrayIcon = exports.platform = exports.getUrlAccountId = void 0;
const path = require("path");
const electron_1 = require("electron");
const electron_util_1 = require("electron-util");
// URL: `mail.google.com/mail/u/<local_account_id>`
function getUrlAccountId(url) {
    const accountIdRegExpResult = /mail\/u\/(\d+)/.exec(url);
    return accountIdRegExpResult === null || accountIdRegExpResult === void 0 ? void 0 : accountIdRegExpResult[1];
}
exports.getUrlAccountId = getUrlAccountId;
exports.platform = electron_util_1.platform({
    macos: 'macos',
    linux: 'linux',
    windows: 'windows'
});
/**
 * Create a tray icon.
 *
 * @param unread True to create the unead icon; false to create the normal icon.
 */
function createTrayIcon(unread) {
    let iconFileName;
    if (electron_util_1.is.macos) {
        iconFileName = 'tray-icon.macos.Template.png';
    }
    else {
        iconFileName = unread ? 'tray-icon-unread.png' : 'tray-icon.png';
    }
    return electron_1.nativeImage.createFromPath(path.join(__dirname, '..', 'static', iconFileName));
}
exports.createTrayIcon = createTrayIcon;
