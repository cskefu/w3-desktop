"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const electron_1 = require("electron");
const path = require("path");
const electronDl = require("electron-dl");
const config_1 = require("./config");
const notifications_1 = require("./notifications");
const messages = {
    cancelled: 'has been cancelled',
    completed: 'has completed',
    interrupted: 'has been interrupted'
};
function onDownloadComplete(filename, state) {
    notifications_1.createNotification(`Download ${state}`, `Download of file ${filename} ${messages[state]}.`, () => {
        electron_1.shell.openPath(path.join(config_1.default.get(config_1.ConfigKey.DownloadsLocation), filename));
    });
}
function init() {
    const openFolderWhenDone = config_1.default.get(config_1.ConfigKey.DownloadsOpenFolderWhenDone);
    const handleStarted = (item) => {
        item.once('done', (_, state) => {
            onDownloadComplete(item.getFilename(), state);
        });
    };
    electronDl({
        saveAs: config_1.default.get(config_1.ConfigKey.DownloadsShowSaveAs),
        openFolderWhenDone,
        directory: config_1.default.get(config_1.ConfigKey.DownloadsLocation),
        showBadge: false,
        onStarted: openFolderWhenDone ? undefined : handleStarted
    });
}
exports.init = init;
