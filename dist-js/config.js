"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigKey = void 0;
const electron_1 = require("electron");
const electron_util_1 = require("electron-util");
const path = require("path");
const jsonfile = require("jsonfile");
const Store = require("electron-store");
const pkgJSON = jsonfile.readFileSync(path.join(__dirname, '..', 'package.json'));
var ConfigKey;
(function (ConfigKey) {
    ConfigKey["AppUrl"] = "appUrl";
    ConfigKey["AutoUpdate"] = "autoUpdate";
    ConfigKey["CompactHeader"] = "compactHeader";
    ConfigKey["DebugMode"] = "debugMode";
    ConfigKey["HideFooter"] = "hideFooter";
    ConfigKey["HideSupport"] = "hideSupport";
    ConfigKey["LastWindowState"] = "lastWindowState";
    ConfigKey["LaunchMinimized"] = "launchMinimized";
    ConfigKey["AutoHideMenuBar"] = "autoHideMenuBar";
    ConfigKey["EnableTrayIcon"] = "enableTrayIcon";
    ConfigKey["ShowDockIcon"] = "showDockIcon";
    ConfigKey["CustomUserAgent"] = "customUserAgent";
    ConfigKey["AutoFixUserAgent"] = "autoFixUserAgent";
    ConfigKey["TrustedHosts"] = "trustedHosts";
    ConfigKey["ConfirmExternalLinks"] = "confirmExternalLinks";
    ConfigKey["HardwareAcceleration"] = "hardwareAcceleration";
    ConfigKey["DownloadsShowSaveAs"] = "downloadsShowSaveAs";
    ConfigKey["DownloadsOpenFolderWhenDone"] = "downloadsOpenFolderWhenDone";
    ConfigKey["DownloadsLocation"] = "downloadsLocation";
    ConfigKey["DarkMode"] = "darkMode";
    ConfigKey["ResetConfig"] = "resetConfig";
    ConfigKey["ReleaseChannel"] = "releaseChannel";
})(ConfigKey = exports.ConfigKey || (exports.ConfigKey = {}));
const defaults = {
    [ConfigKey.AppUrl]: pkgJSON.appUrl,
    [ConfigKey.AutoUpdate]: true,
    [ConfigKey.LastWindowState]: {
        bounds: {
            width: 860,
            height: 600,
            x: undefined,
            y: undefined
        },
        fullscreen: false,
        maximized: false
    },
    [ConfigKey.CompactHeader]: true,
    [ConfigKey.HideFooter]: true,
    [ConfigKey.HideSupport]: true,
    [ConfigKey.DebugMode]: electron_util_1.is.development,
    [ConfigKey.LaunchMinimized]: false,
    [ConfigKey.AutoHideMenuBar]: false,
    [ConfigKey.EnableTrayIcon]: !electron_util_1.is.macos,
    [ConfigKey.ShowDockIcon]: true,
    [ConfigKey.CustomUserAgent]: '',
    [ConfigKey.AutoFixUserAgent]: false,
    [ConfigKey.TrustedHosts]: [],
    [ConfigKey.ConfirmExternalLinks]: true,
    [ConfigKey.HardwareAcceleration]: true,
    [ConfigKey.DownloadsShowSaveAs]: false,
    [ConfigKey.DownloadsOpenFolderWhenDone]: true,
    [ConfigKey.DownloadsLocation]: electron_1.app.getPath('downloads'),
    [ConfigKey.ResetConfig]: false,
    [ConfigKey.ReleaseChannel]: 'stable'
};
const config = new Store({
    defaults,
    name: electron_util_1.is.development ? 'config.dev' : 'config',
    migrations: {
        '>=2.21.2': (store) => {
            const hideRightSidebar = store.get('hideRightSidebar');
            if (typeof hideRightSidebar === 'boolean') {
                // @ts-expect-error
                store.delete('hideRightSidebar');
            }
        },
        '>2.21.2': (store) => {
            const overrideUserAgent = store.get('overrideUserAgent');
            if (typeof overrideUserAgent === 'string') {
                if (overrideUserAgent.length > 0) {
                    store.set(ConfigKey.CustomUserAgent, overrideUserAgent);
                }
                // @ts-expect-error
                store.delete('overrideUserAgent');
            }
        }
    }
});
if (config.get(ConfigKey.ResetConfig)) {
    config.clear();
    config.set(ConfigKey.ResetConfig, false);
}
exports.default = config;
