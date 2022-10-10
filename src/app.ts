import * as fs from 'fs'
import * as path from 'path'
import { app, shell, BrowserWindow, dialog, nativeTheme } from 'electron'
import { is } from 'electron-util'

import config, { ConfigKey } from './config'
import {
  init as initCustomStyles,
  USER_CUSTOM_STYLE_PATH
} from './custom-styles'
import { init as initDebug } from './debug'
import { init as initDownloads } from './downloads'
import { platform } from './helpers'
import { initOrUpdateMenu } from './menu'
import {
  setAppMenuBarVisibility,
} from './utils'

import electronContextMenu = require('electron-context-menu')
import * as jsonfile from 'jsonfile'

initDebug()
initDownloads()

const pkgJSON = jsonfile.readFileSync(
  path.join(__dirname, '..', 'package.json')
)

electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true })

if (!config.get(ConfigKey.HardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

const shouldStartMinimized =
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)

app.setAppUserModelId(pkgJSON.appId)

let mainWindow: BrowserWindow

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

switch (config.get(ConfigKey.DarkMode)) {
  case 'system':
    nativeTheme.themeSource = 'system'
    break
  case true:
    nativeTheme.themeSource = 'dark'
    break
  default:
    nativeTheme.themeSource = 'light'
}

function createWindow(): void {
  const lastWindowState = config.get(ConfigKey.LastWindowState)

  mainWindow = new BrowserWindow({
    title: app.name,
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
    icon: is.linux
      ? path.join(__dirname, '..', 'static', 'icon.png')
      : undefined,
    darkTheme: nativeTheme.shouldUseDarkColors
  })

  // MainWindow.setFullScreen(true);
  // if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
  //   mainWindow.setFullScreen(lastWindowState.fullscreen)
  // }

  mainWindow.maximize()
  // If (lastWindowState.maximized && !mainWindow.isMaximized()) {
  //   mainWindow.maximize()
  // }

  if (is.linux || is.windows) {
    setAppMenuBarVisibility()
  }

  mainWindow.loadURL(config.get(ConfigKey.AppUrl))

  mainWindow.on('app-command', (_event, command) => {
    if (command === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      mainWindow.webContents.goBack()
    } else if (
      command === 'browser-forward' &&
      mainWindow.webContents.canGoForward()
    ) {
      mainWindow.webContents.goForward()
    }
  })

  mainWindow.webContents.on('dom-ready', () => {
    addCustomCSS(mainWindow)
    initCustomStyles()
  })

  mainWindow.webContents.on('did-finish-load', async () => {
  })


  mainWindow.webContents.on('new-window', newEvent => {
    console.log("Blocked by 'new-window'")
    newEvent.preventDefault();
  });

  mainWindow.webContents.on('will-navigate', (newEvent, url) => {
    console.log("Handled by 'will-navigate' " + url)
    if (!url.includes(pkgJSON.allowedInternalUrlDomain)) {
      newEvent.preventDefault()
      setImmediate(() => {
        openExternalUrl(url);
      });
      return;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("[setWindowOpenHandler] " + url)
    if (!url.includes(pkgJSON.allowedInternalUrlDomain)) {
      console.log("Blocked by 'setWindowOpenHandler'")
      setImmediate(() => {
        openExternalUrl(url);
      });
      return { action: 'deny' }
    } else {
      return { action: 'allow' }
    }
  })
}

function addCustomCSS(windowElement: BrowserWindow): void {
  windowElement.webContents.insertCSS(
    fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8')
  )

  if (fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
    windowElement.webContents.insertCSS(
      fs.readFileSync(USER_CUSTOM_STYLE_PATH, 'utf8')
    )
  }

  const platformCSSFile = path.join(
    __dirname,
    '..',
    'css',
    `style.${platform}.css`
  )
  if (fs.existsSync(platformCSSFile)) {
    windowElement.webContents.insertCSS(
      fs.readFileSync(platformCSSFile, 'utf8')
    )
  }
}

async function openExternalUrl(url: string): Promise<void> {
  const cleanURL = url

  if (config.get(ConfigKey.ConfirmExternalLinks)) {
    const { origin } = new URL(cleanURL)
    const trustedHosts = config.get(ConfigKey.TrustedHosts)

    if (!trustedHosts.includes(origin)) {
      const { response, checkboxChecked } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Open Link', 'Cancel'],
        message: `Do you want to open this external link in your default browser?`,
        checkboxLabel: `Trust all links on ${origin}`,
        detail: cleanURL
      })

      if (response !== 0) return

      if (checkboxChecked) {
        config.set(ConfigKey.TrustedHosts, [...trustedHosts, origin])
      }
    }
  }

  shell.openExternal(cleanURL)
}

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  if (mainWindow) {
    config.set(ConfigKey.LastWindowState, {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    })
    mainWindow.removeAllListeners('close')
    mainWindow.close()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
  ; (async () => {
    await Promise.all([app.whenReady()])

    const customUserAgent = config.get(ConfigKey.CustomUserAgent)

    if (customUserAgent) {
      app.userAgentFallback = customUserAgent
    }

    createWindow()

    initOrUpdateMenu()

    const { webContents } = mainWindow!

    webContents.on('dom-ready', () => {
      if (!shouldStartMinimized) {
        mainWindow.show()
      }
    })

    if (config.get(ConfigKey.DarkMode) === undefined) {
      const { response } = await dialog.showMessageBox({
        type: 'info',
        message: `${app.name} (now) has dark mode! Do you want to enable it?`,
        detail:
          'It\'s recommended to set the Gmail theme to "Default" in order for dark mode to work properly.',
        buttons: ['Yes', 'No', 'Follow System Appearance', 'Ask Again Later']
      })

      if (response === 0) {
        nativeTheme.themeSource = 'dark'
        config.set(ConfigKey.DarkMode, true)
        initOrUpdateMenu()
      } else if (response === 1) {
        nativeTheme.themeSource = 'light'
        config.set(ConfigKey.DarkMode, false)
        initOrUpdateMenu()
      } else if (response === 2) {
        nativeTheme.themeSource = 'system'
        config.set(ConfigKey.DarkMode, 'system')
        initOrUpdateMenu()
      }
    }
  })()
