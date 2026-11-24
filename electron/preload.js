
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("voiceAPI", {
  // Uygulama kısayollarını ana süreçte, pencere odağı dışında da dinle.
  setGlobalShortcuts: (shortcuts) => {
    ipcRenderer.send("voice:set-global-shortcuts", shortcuts);
  },
  onGlobalShortcut: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("voice:global-shortcut", listener);
    return () => ipcRenderer.removeListener("voice:global-shortcut", listener);
  },

  // Bas-konuş tuşunu değiştirme
  setPushToTalkKey: (key) => {
    ipcRenderer.send("ptt:set-key", key);
  },

  // Bas-konuş özelliğini açma / kapatma
  setPushToTalkEnabled: (enabled) => {
    ipcRenderer.send("ptt:set-enabled", enabled);
  },

  // Bas-konuş durumunu sıfırlama
  resetPushToTalk: () => {
    ipcRenderer.send("ptt:reset");
  },

  // Tuşa basıldığında
  onPushToTalkDown: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("ptt:keydown", listener);

    return () => {
      ipcRenderer.removeListener("ptt:keydown", listener);
    };
  },

  // Tuş bırakıldığında
  onPushToTalkUp: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("ptt:keyup", listener);

    return () => {
      ipcRenderer.removeListener("ptt:keyup", listener);
    };
  },

  // Tuş değiştirme sonucu
  onPushToTalkKeyChanged: (callback) => {
    const listener = (_event, key) => callback(key);
    ipcRenderer.on("ptt:key-changed", listener);

    return () => {
      ipcRenderer.removeListener("ptt:key-changed", listener);
    };
  },

  // Tuş değiştirme hatası
  onPushToTalkKeyError: (callback) => {
    const listener = (_event, error) => callback(error);
    ipcRenderer.on("ptt:key-error", listener);

    return () => {
      ipcRenderer.removeListener("ptt:key-error", listener);
    };
  }
});
