
const {
  app,
  BrowserWindow,
  session,
  desktopCapturer,
  dialog,
  ipcMain
} = require('electron');

const path = require('path');
const { uIOhook, UiohookKey } = require('uiohook-napi');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let pushToTalkKey = 'V';
let pushToTalkEnabled = false;
let pushToTalkPressed = false;
let hookStarted = false;

let globalShortcuts = {
  mute: 'M',
  deafen: 'D',
  settings: 'O'
};

const lastShortcutAt = new Map();

// -----------------------------
// OTOMATİK GÜNCELLEME
// -----------------------------

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('VOICE güncelleme kontrolü yapılıyor...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Yeni VOICE güncellemesi bulundu:', info.version);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('VOICE güncel.');
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`Güncelleme indiriliyor: %${Math.round(progress.percent)}`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('VOICE güncellemesi indirildi:', info.version);

    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'VOICE Güncellemesi',
        message: `VOICE ${info.version} güncellemesi hazır.`,
        detail: 'Güncellemeyi yüklemek için uygulama yeniden başlatılacak.',
        buttons: ['Şimdi yeniden başlat', 'Daha sonra'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    }
  });

  autoUpdater.on('error', (error) => {
    console.error('VOICE güncelleme hatası:', error);
  });

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Güncelleme kontrolü başarısız:', error);
  });
}

// -----------------------------
// KLAVYE KONTROLLERİ
// -----------------------------

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/^KEY/, '');
}

function getHookKeyCode(value) {
  const key = normalizeKey(value);

  if (!key) return null;

  const aliases = {
    ESC: ['VC_ESCAPE', 'VC_ESC'],
    ESCAPE: ['VC_ESCAPE', 'VC_ESC'],
    SPACE: ['VC_SPACE'],
    ENTER: ['VC_ENTER'],
    TAB: ['VC_TAB'],
    BACKSPACE: ['VC_BACKSPACE'],
    CAPS_LOCK: ['VC_CAPS_LOCK'],
    SHIFT: ['VC_SHIFT_L', 'VC_SHIFT_R'],
    CTRL: ['VC_CONTROL_L', 'VC_CONTROL_R'],
    ALT: ['VC_ALT_L', 'VC_ALT_R']
  };

  const candidates = aliases[key] || [
    `VC_${key}`,
    `KEY_${key}`,
    key
  ];

  const codes = candidates
    .map(name => UiohookKey[name])
    .filter(value => typeof value === 'number');

  if (!codes.length) return null;

  return codes.length === 1 ? codes[0] : codes;
}

function matchesConfiguredKey(keycode, configuredKey) {
  const mapped = getHookKeyCode(configuredKey);

  if (Array.isArray(mapped)) {
    return mapped.includes(keycode);
  }

  return mapped !== null && mapped === keycode;
}

function emitPtt(eventName) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(eventName);
  }
}

function resetPtt() {
  if (pushToTalkPressed) {
    pushToTalkPressed = false;
    emitPtt('ptt:keyup');
  }
}

function onGlobalKeyDown(event) {
  const keycode = event?.keycode;

  if (typeof keycode !== 'number') return;

  if (
    pushToTalkEnabled &&
    matchesConfiguredKey(keycode, pushToTalkKey) &&
    !pushToTalkPressed
  ) {
    pushToTalkPressed = true;
    emitPtt('ptt:keydown');
  }

  for (const [action, key] of Object.entries(globalShortcuts)) {
    if (key && matchesConfiguredKey(keycode, key)) {
      if (
        !(pushToTalkEnabled &&
          matchesConfiguredKey(keycode, pushToTalkKey))
      ) {
        const now = Date.now();
        const previous = lastShortcutAt.get(action) || 0;

        if (
          now - previous > 300 &&
          mainWindow &&
          !mainWindow.isDestroyed()
        ) {
          lastShortcutAt.set(action, now);
          mainWindow.webContents.send(
            'voice:global-shortcut',
            action
          );
        }
      }

      break;
    }
  }
}

function onGlobalKeyUp(event) {
  const keycode = event?.keycode;

  if (typeof keycode !== 'number') return;

  if (
    pushToTalkPressed &&
    matchesConfiguredKey(keycode, pushToTalkKey)
  ) {
    resetPtt();
  }
}

function startKeyboardHook() {
  if (hookStarted) return;

  try {
    uIOhook.on('keydown', onGlobalKeyDown);
    uIOhook.on('keyup', onGlobalKeyUp);

    uIOhook.start();
    hookStarted = true;
  } catch (error) {
    console.error(
      'VOICE global klavye dinleyicisi başlatılamadı:',
      error
    );

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        'ptt:key-error',
        error.message
      );
    }
  }
}

function stopKeyboardHook() {
  resetPtt();

  if (!hookStarted) return;

  try {
    uIOhook.off('keydown', onGlobalKeyDown);
    uIOhook.off('keyup', onGlobalKeyUp);
    uIOhook.stop();
  } catch (error) {
    console.warn(
      'Klavye dinleyicisi durdurulamadı:',
      error
    );
  }

  hookStarted = false;
}

// -----------------------------
// IPC
// -----------------------------

function installPushToTalkIpc() {
  ipcMain.on('ptt:set-key', (_event, key) => {
    pushToTalkKey = normalizeKey(key) || 'V';
    resetPtt();

    mainWindow?.webContents.send(
      'ptt:key-changed',
      pushToTalkKey
    );
  });

  ipcMain.on('ptt:set-enabled', (_event, enabled) => {
    pushToTalkEnabled = Boolean(enabled);

    if (pushToTalkEnabled) {
      startKeyboardHook();
    } else {
      resetPtt();
    }
  });

  ipcMain.on('ptt:reset', () => {
    resetPtt();
  });

  ipcMain.on(
    'voice:set-global-shortcuts',
    (_event, shortcuts) => {
      globalShortcuts = {
        mute: normalizeKey(shortcuts?.mute),
        deafen: normalizeKey(shortcuts?.deafen),
        settings: normalizeKey(shortcuts?.settings)
      };

      startKeyboardHook();
    }
  );
}

// -----------------------------
// MEDYA İZİNLERİ
// -----------------------------

function installMediaPermissions() {
  const ses = session.defaultSession;

  ses.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(
        ['media', 'display-capture', 'notifications']
          .includes(permission)
      );
    }
  );

  ses.setPermissionCheckHandler(
    (_webContents, permission) => {
      return [
        'media',
        'display-capture',
        'notifications'
      ].includes(permission);
    }
  );

  ses.setDisplayMediaRequestHandler(
    async (request, callback) => {
      let callbackCalled = false;

      const finish = (result) => {
        if (callbackCalled) return;

        callbackCalled = true;
        callback(result);
      };

      try {
        if (!request.videoRequested) {
          console.warn(
            'Ekran yakalama isteğinde video istenmedi:',
            request
          );

          finish(null);
          return;
        }

        const sources = await desktopCapturer.getSources({
          types: ['screen', 'window'],
          thumbnailSize: {
            width: 0,
            height: 0
          },
          fetchWindowIcons: false
        });

        if (!Array.isArray(sources) || sources.length === 0) {
          console.error(
            'desktopCapturer hiç ekran/pencere kaynağı döndürmedi.'
          );

          finish(null);
          return;
        }

        const labels = sources.map((source, index) => {
          const type = String(source.id || '')
            .startsWith('screen:')
            ? 'Ekran'
            : 'Pencere';

          return `${index + 1}. ${type}: ${source.name || 'Adsız kaynak'}`;
        });

        const parent =
          mainWindow && !mainWindow.isDestroyed()
            ? mainWindow
            : undefined;

        const result = await dialog.showMessageBox(parent, {
          type: 'question',
          title: 'VOICE - Ekran Paylaşımı',
          message: 'Paylaşmak istediğin ekranı veya pencereyi seç:',
          detail:
            'Seçtiğin görüntü ses kanalındaki katılımcılarla paylaşılır.',
          buttons: [...labels, 'İptal'],
          cancelId: labels.length,
          defaultId: 0,
          noLink: true
        });

        if (
          result.response < 0 ||
          result.response >= sources.length
        ) {
          finish(null);
          return;
        }

        const selectedSource = sources[result.response];

        if (!selectedSource?.id) {
          console.error(
            'Seçilen ekran kaynağında geçerli ID yok:',
            selectedSource
          );

          finish(null);
          return;
        }

        console.log(
          'VOICE ekran kaynağı seçildi:',
          selectedSource.name,
          selectedSource.id
        );

        finish({
          video: selectedSource
        });
      } catch (error) {
        console.error(
          'Ekran yakalama isteği başarısız:',
          error?.stack || error
        );

        try {
          finish(null);
        } catch (callbackError) {
          console.error(
            'Ekran yakalama callback hatası:',
            callbackError
          );
        }
      }
    }
  );
}

// -----------------------------
// ANA PENCERE
// -----------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'VOICE',
    backgroundColor: '#111318',

    titleBarStyle: 'hidden',

    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#ffffff',
      height: 32
    },

    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile(
    path.join(__dirname, '..', 'dist', 'index.html')
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -----------------------------
// UYGULAMA BAŞLANGICI
// -----------------------------

app.whenReady().then(() => {
  installMediaPermissions();
  installPushToTalkIpc();

  createWindow();

  setupAutoUpdater();

  startKeyboardHook();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// -----------------------------
// UYGULAMA KAPANIŞI
// -----------------------------

app.on('before-quit', () => {
  pushToTalkEnabled = false;
  stopKeyboardHook();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
