import { app, shell, Menu, MenuItemConstructorOptions, dialog } from 'electron'
import * as fs from 'fs'
import { is } from 'electron-util'

// Import { checkForUpdates, changeReleaseChannel } from './updates'
import config, { ConfigKey } from './config'
import { setCustomStyle, USER_CUSTOM_STYLE_PATH } from './custom-styles'
// Import { viewLogs } from './logs'
import { showRestartDialog, setAppMenuBarVisibility } from './utils'
import { autoFixUserAgent, removeCustomUserAgent } from './user-agent'

interface AppearanceMenuItem {
  key: ConfigKey
  label: string
  restartDialogText?: string
  setMenuBarVisibility?: boolean
}

export function initOrUpdateMenu() {
  const appearanceMenuItems: AppearanceMenuItem[] = [
    {
      key: ConfigKey.CompactHeader,
      label: 'Compact Header',
      restartDialogText: 'compact header'
    },
    {
      key: ConfigKey.HideFooter,
      label: 'Hide Footer'
    },
    {
      key: ConfigKey.HideSupport,
      label: 'Hide Support'
    }
  ]

  const createAppearanceMenuItem = ({
    key,
    label,
    restartDialogText,
    setMenuBarVisibility
  }: AppearanceMenuItem): MenuItemConstructorOptions => ({
    label,
    type: 'checkbox',
    checked: config.get(key) as boolean,
    click({ checked }: { checked: boolean }) {
      config.set(key, checked)

      // If the style changes requires a restart, don't add or remove the class
      // name from the DOM
      if (restartDialogText) {
        showRestartDialog(checked, restartDialogText)
      } else {
        setCustomStyle(key, checked)
      }

      if (setMenuBarVisibility) {
        setAppMenuBarVisibility(true)
      }
    }
  })

  if (is.linux || is.windows) {
    appearanceMenuItems.unshift({
      key: ConfigKey.AutoHideMenuBar,
      label: 'Hide Menu bar',
      setMenuBarVisibility: true
    })
  }

  const appMenu: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          label: `About ${app.name}`,
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
          label: `Hide ${app.name}`,
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
          label: `Quit ${app.name}`,
          accelerator: 'CommandOrControl+Q',
          click() {
            app.quit()
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
            ...appearanceMenuItems.map((item) =>
              createAppearanceMenuItem(item)
            ),
            {
              label: 'Custom Styles',
              click() {
                // Create the custom style file if it doesn't exist
                if (!fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
                  fs.closeSync(fs.openSync(USER_CUSTOM_STYLE_PATH, 'w'))
                }

                shell.openPath(USER_CUSTOM_STYLE_PATH)
              }
            }
          ]
        },
        {
          label: 'Confirm External Links before Opening',
          type: 'checkbox',
          checked: config.get(ConfigKey.ConfirmExternalLinks),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.ConfirmExternalLinks, checked)
          }
        },
        {
          label: 'Hardware Acceleration',
          type: 'checkbox',
          checked: config.get(ConfigKey.HardwareAcceleration),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.HardwareAcceleration, checked)
            showRestartDialog(checked, 'hardware acceleration')
          }
        },
        {
          label: 'Downloads',
          submenu: [
            {
              label: 'Show Save As Dialog Before Downloading',
              type: 'checkbox',
              checked: config.get(ConfigKey.DownloadsShowSaveAs),
              click({ checked }) {
                config.set(ConfigKey.DownloadsShowSaveAs, checked)

                showRestartDialog()
              }
            },
            {
              label: 'Open Folder When Done',
              type: 'checkbox',
              checked: config.get(ConfigKey.DownloadsOpenFolderWhenDone),
              click({ checked }) {
                config.set(ConfigKey.DownloadsOpenFolderWhenDone, checked)

                showRestartDialog()
              }
            },
            {
              label: 'Default Location',
              async click() {
                const { canceled, filePaths } = await dialog.showOpenDialog({
                  properties: ['openDirectory'],
                  buttonLabel: 'Select',
                  defaultPath: config.get(ConfigKey.DownloadsLocation)
                })

                if (canceled) {
                  return
                }

                config.set(ConfigKey.DownloadsLocation, filePaths[0])

                showRestartDialog()
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
              checked: config.get(ConfigKey.DebugMode),
              click({ checked }) {
                config.set(ConfigKey.DebugMode, checked)
                showRestartDialog(checked, 'debug mode')
              }
            },
            {
              label: 'Edit Config File',
              click() {
                config.openInEditor()
              }
            },
            {
              label: 'Reset Config File',
              click() {
                config.set(ConfigKey.ResetConfig, true)
                showRestartDialog()
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
                    autoFixUserAgent()
                  }
                },
                {
                  label: 'Set Custom User Agent',
                  click() {
                    config.openInEditor()
                  }
                },
                {
                  label: 'Remove Custom User Agent',
                  enabled: Boolean(config.get(ConfigKey.CustomUserAgent)),
                  click() {
                    removeCustomUserAgent()
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
  ]

  // Add the develop menu when running in the development environment
  if (is.development) {
    appMenu.splice(-1, 0, {
      label: 'Develop',
      submenu: [
        {
          label: 'Clear Cache and Restart',
          click() {
            // Clear app config
            config.clear()
            // Restart without firing quitting events
            app.relaunch()
            app.exit(0)
          }
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(appMenu)

  Menu.setApplicationMenu(menu)
}
