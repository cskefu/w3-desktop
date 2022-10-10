import Store = require('electron-store');
interface LastWindowState {
    bounds: {
        width: number;
        height: number;
        x: number | undefined;
        y: number | undefined;
    };
    fullscreen: boolean;
    maximized: boolean;
}
export declare enum ConfigKey {
    AppUrl = "appUrl",
    AutoUpdate = "autoUpdate",
    CompactHeader = "compactHeader",
    DebugMode = "debugMode",
    HideFooter = "hideFooter",
    HideSupport = "hideSupport",
    LastWindowState = "lastWindowState",
    LaunchMinimized = "launchMinimized",
    AutoHideMenuBar = "autoHideMenuBar",
    EnableTrayIcon = "enableTrayIcon",
    ShowDockIcon = "showDockIcon",
    CustomUserAgent = "customUserAgent",
    AutoFixUserAgent = "autoFixUserAgent",
    TrustedHosts = "trustedHosts",
    ConfirmExternalLinks = "confirmExternalLinks",
    HardwareAcceleration = "hardwareAcceleration",
    DownloadsShowSaveAs = "downloadsShowSaveAs",
    DownloadsOpenFolderWhenDone = "downloadsOpenFolderWhenDone",
    DownloadsLocation = "downloadsLocation",
    DarkMode = "darkMode",
    ResetConfig = "resetConfig",
    ReleaseChannel = "releaseChannel"
}
declare type TypedStore = {
    [ConfigKey.AppUrl]: string;
    [ConfigKey.AutoUpdate]: boolean;
    [ConfigKey.LastWindowState]: LastWindowState;
    [ConfigKey.CompactHeader]: boolean;
    [ConfigKey.HideFooter]: boolean;
    [ConfigKey.HideSupport]: boolean;
    [ConfigKey.DebugMode]: boolean;
    [ConfigKey.LaunchMinimized]: boolean;
    [ConfigKey.AutoHideMenuBar]: boolean;
    [ConfigKey.EnableTrayIcon]: boolean;
    [ConfigKey.ShowDockIcon]: boolean;
    [ConfigKey.CustomUserAgent]: string;
    [ConfigKey.AutoFixUserAgent]: boolean;
    [ConfigKey.TrustedHosts]: string[];
    [ConfigKey.ConfirmExternalLinks]: boolean;
    [ConfigKey.HardwareAcceleration]: boolean;
    [ConfigKey.DownloadsShowSaveAs]: boolean;
    [ConfigKey.DownloadsOpenFolderWhenDone]: boolean;
    [ConfigKey.DownloadsLocation]: string;
    [ConfigKey.DarkMode]?: 'system' | boolean;
    [ConfigKey.ResetConfig]: boolean;
    [ConfigKey.ReleaseChannel]: 'stable' | 'dev';
};
declare const config: Store<TypedStore>;
export default config;
