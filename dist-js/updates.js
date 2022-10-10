"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForUpdates = exports.init = exports.changeReleaseChannel = void 0;
const electron_1 = require("electron");
const electron_log_1 = require("electron-log");
const electron_updater_1 = require("electron-updater");
const electron_util_1 = require("electron-util");
const config_1 = require("./config");
const logs_1 = require("./logs");
const notifications_1 = require("./notifications");
const menu_1 = require("./menu");
const UPDATE_CHECK_INTERVAL = 60000 * 60 * 3; // 3 Hours
function changeReleaseChannel(channel) {
    electron_updater_1.autoUpdater.allowPrerelease = channel === 'dev';
    electron_updater_1.autoUpdater.allowDowngrade = true;
    checkForUpdates();
    config_1.default.set(config_1.ConfigKey.ReleaseChannel, channel);
}
exports.changeReleaseChannel = changeReleaseChannel;
function onUpdateAvailable() {
    notifications_1.createNotification('Update available', `Please restart ${electron_1.app.name} to update to the latest version`, () => {
        electron_1.app.relaunch();
        electron_1.app.quit();
    });
}
function init() {
    if (!electron_util_1.is.development) {
        electron_log_1.default.transports.file.level = 'info';
        electron_updater_1.autoUpdater.logger = electron_log_1.default;
        if (electron_updater_1.autoUpdater.allowPrerelease &&
            config_1.default.get(config_1.ConfigKey.ReleaseChannel) === 'stable') {
            config_1.default.set(config_1.ConfigKey.ReleaseChannel, 'dev');
            menu_1.initOrUpdateMenu();
        }
        else if (!electron_updater_1.autoUpdater.allowPrerelease &&
            config_1.default.get(config_1.ConfigKey.ReleaseChannel) === 'dev') {
            electron_updater_1.autoUpdater.allowPrerelease = true;
            checkForUpdates();
            menu_1.initOrUpdateMenu();
        }
        electron_updater_1.autoUpdater.on('update-downloaded', onUpdateAvailable);
        if (config_1.default.get(config_1.ConfigKey.AutoUpdate)) {
            setInterval(() => electron_updater_1.autoUpdater.checkForUpdates, UPDATE_CHECK_INTERVAL);
            electron_updater_1.autoUpdater.checkForUpdates();
        }
    }
}
exports.init = init;
async function checkForUpdates() {
    try {
        const { downloadPromise } = await electron_updater_1.autoUpdater.checkForUpdates();
        // If there isn't an update, notify the user
        if (!downloadPromise) {
            electron_1.dialog.showMessageBox({
                type: 'info',
                message: 'There are currently no updates available.'
            });
        }
    }
    catch (error) {
        electron_log_1.default.error('Check for updates failed', error);
        notifications_1.createNotification('Check for updates failed', 'View the logs for more information', logs_1.viewLogs);
    }
}
exports.checkForUpdates = checkForUpdates;
