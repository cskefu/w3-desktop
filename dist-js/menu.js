"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOrUpdateMenu = void 0;
const electron_1 = require("electron");
const fs = require("fs");
const electron_util_1 = require("electron-util");
// Import { checkForUpdates, changeReleaseChannel } from './updates'
const config_1 = require("./config");
const custom_styles_1 = require("./custom-styles");
// Import { viewLogs } from './logs'
const utils_1 = require("./utils");
const user_agent_1 = require("./user-agent");
function initOrUpdateMenu() {
    const appearanceMenuItems = [
        {
            key: config_1.ConfigKey.CompactHeader,
            label: 'Compact Header',
            restartDialogText: 'compact header'
        },
        {
            key: config_1.ConfigKey.HideFooter,
            label: 'Hide Footer'
        },
        {
            key: config_1.ConfigKey.HideSupport,
            label: 'Hide Support'
        }
    ];
    const createAppearanceMenuItem = ({ key, label, restartDialogText, setMenuBarVisibility }) => ({
        label,
        type: 'checkbox',
        checked: config_1.default.get(key),
        click({ checked }) {
            config_1.default.set(key, checked);
            // If the style changes requires a restart, don't add or remove the class
            // name from the DOM
            if (restartDialogText) {
                utils_1.showRestartDialog(checked, restartDialogText);
            }
            else {
                custom_styles_1.setCustomStyle(key, checked);
            }
            if (setMenuBarVisibility) {
                utils_1.setAppMenuBarVisibility(true);
            }
        }
    });
    if (electron_util_1.is.linux || electron_util_1.is.windows) {
        appearanceMenuItems.unshift({
            key: config_1.ConfigKey.AutoHideMenuBar,
            label: 'Hide Menu bar',
            setMenuBarVisibility: true
        });
    }
    const appMenu = [
        {
            label: electron_1.app.name,
            submenu: [
                {
                    label: `About ${electron_1.app.name}`,
                    role: 'about'
                },
                // {
                //   label: 'Check for Updates...',
                //   click() {
                //     checkForUpdates()
                //   }
                // },
                {
                    type: 'separator'
                },
                {
                    label: `Hide ${electron_1.app.name}`,
                    accelerator: 'Alt+Esc',
                    role: 'hide'
                },
                // {
                //   label: 'Hide Others',
                //   accelerator: 'CommandOrControl+Shift+H',
                //   role: 'hideOthers'
                // },
                // {
                //   label: 'Show All',
                //   role: 'unhide'
                // },
                {
                    type: 'separator'
                },
                {
                    label: `Quit ${electron_1.app.name}`,
                    accelerator: 'CommandOrControl+Q',
                    click() {
                        electron_1.app.quit();
                    }
                }
            ]
        },
        {
            label: 'Settings',
            submenu: [
                {
                    label: 'Appearance',
                    submenu: [
                        ...appearanceMenuItems.map((item) => createAppearanceMenuItem(item)),
                        {
                            label: 'Custom Styles',
                            click() {
                                // Create the custom style file if it doesn't exist
                                if (!fs.existsSync(custom_styles_1.USER_CUSTOM_STYLE_PATH)) {
                                    fs.closeSync(fs.openSync(custom_styles_1.USER_CUSTOM_STYLE_PATH, 'w'));
                                }
                                electron_1.shell.openPath(custom_styles_1.USER_CUSTOM_STYLE_PATH);
                            }
                        }
                    ]
                },
                {
                    label: 'Confirm External Links before Opening',
                    type: 'checkbox',
                    checked: config_1.default.get(config_1.ConfigKey.ConfirmExternalLinks),
                    click({ checked }) {
                        config_1.default.set(config_1.ConfigKey.ConfirmExternalLinks, checked);
                    }
                },
                {
                    label: 'Hardware Acceleration',
                    type: 'checkbox',
                    checked: config_1.default.get(config_1.ConfigKey.HardwareAcceleration),
                    click({ checked }) {
                        config_1.default.set(config_1.ConfigKey.HardwareAcceleration, checked);
                        utils_1.showRestartDialog(checked, 'hardware acceleration');
                    }
                },
                {
                    label: 'Downloads',
                    submenu: [
                        {
                            label: 'Show Save As Dialog Before Downloading',
                            type: 'checkbox',
                            checked: config_1.default.get(config_1.ConfigKey.DownloadsShowSaveAs),
                            click({ checked }) {
                                config_1.default.set(config_1.ConfigKey.DownloadsShowSaveAs, checked);
                                utils_1.showRestartDialog();
                            }
                        },
                        {
                            label: 'Open Folder When Done',
                            type: 'checkbox',
                            checked: config_1.default.get(config_1.ConfigKey.DownloadsOpenFolderWhenDone),
                            click({ checked }) {
                                config_1.default.set(config_1.ConfigKey.DownloadsOpenFolderWhenDone, checked);
                                utils_1.showRestartDialog();
                            }
                        },
                        {
                            label: 'Default Location',
                            async click() {
                                const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
                                    properties: ['openDirectory'],
                                    buttonLabel: 'Select',
                                    defaultPath: config_1.default.get(config_1.ConfigKey.DownloadsLocation)
                                });
                                if (canceled) {
                                    return;
                                }
                                config_1.default.set(config_1.ConfigKey.DownloadsLocation, filePaths[0]);
                                utils_1.showRestartDialog();
                            }
                        }
                    ]
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Advanced',
                    submenu: [
                        {
                            label: 'Debug Mode',
                            type: 'checkbox',
                            checked: config_1.default.get(config_1.ConfigKey.DebugMode),
                            click({ checked }) {
                                config_1.default.set(config_1.ConfigKey.DebugMode, checked);
                                utils_1.showRestartDialog(checked, 'debug mode');
                            }
                        },
                        {
                            label: 'Edit Config File',
                            click() {
                                config_1.default.openInEditor();
                            }
                        },
                        {
                            label: 'Reset Config File',
                            click() {
                                config_1.default.set(config_1.ConfigKey.ResetConfig, true);
                                utils_1.showRestartDialog();
                            }
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: 'User Agent',
                            submenu: [
                                {
                                    label: 'Attempt User Agent Fix',
                                    click() {
                                        user_agent_1.autoFixUserAgent();
                                    }
                                },
                                {
                                    label: 'Set Custom User Agent',
                                    click() {
                                        config_1.default.openInEditor();
                                    }
                                },
                                {
                                    label: 'Remove Custom User Agent',
                                    enabled: Boolean(config_1.default.get(config_1.ConfigKey.CustomUserAgent)),
                                    click() {
                                        user_agent_1.removeCustomUserAgent();
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            role: 'editMenu'
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CommandOrControl+M',
                    role: 'minimize'
                },
                {
                    label: 'Close',
                    accelerator: 'CommandOrControl+W',
                    role: 'close'
                }
            ]
        }
        // {
        //   label: 'Help',
        //   role: 'help',
        //   submenu: [
        //     {
        //       label: `${app.name} Website`,
        //       click() {
        //         shell.openExternal('https://github.com/timche/gmail-desktop')
        //       }
        //     },
        //     {
        //       label: 'Report an Issue',
        //       click() {
        //         shell.openExternal(
        //           'https://github.com/timche/gmail-desktop/issues/new/choose'
        //         )
        //       }
        //     },
        //     {
        //       label: 'View Logs',
        //       visible: config.get(ConfigKey.DebugMode),
        //       click() {
        //         viewLogs()
        //       }
        //     }
        //   ]
        // }
    ];
    // Add the develop menu when running in the development environment
    if (electron_util_1.is.development) {
        appMenu.splice(-1, 0, {
            label: 'Develop',
            submenu: [
                {
                    label: 'Clear Cache and Restart',
                    click() {
                        // Clear app config
                        config_1.default.clear();
                        // Restart without firing quitting events
                        electron_1.app.relaunch();
                        electron_1.app.exit(0);
                    }
                }
            ]
        });
    }
    const menu = electron_1.Menu.buildFromTemplate(appMenu);
    electron_1.Menu.setApplicationMenu(menu);
}
exports.initOrUpdateMenu = initOrUpdateMenu;
