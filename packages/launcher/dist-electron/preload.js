import { contextBridge as c, ipcRenderer as e } from "electron";
const n = {
  getConfig: "launcher:getConfig",
  getStatus: "launcher:getStatus",
  getNews: "launcher:getNews",
  sync: "launcher:sync",
  checkUpdate: "launcher:checkUpdate",
  applyUpdate: "launcher:applyUpdate",
  play: "launcher:play",
  openExternal: "launcher:openExternal",
  syncProgress: "launcher:syncProgress",
  updateProgress: "launcher:updateProgress"
}, p = {
  getConfig: () => e.invoke(n.getConfig),
  getStatus: () => e.invoke(n.getStatus),
  getNews: () => e.invoke(n.getNews),
  sync: (r) => e.invoke(n.sync, r),
  checkUpdate: () => e.invoke(n.checkUpdate),
  applyUpdate: () => e.invoke(n.applyUpdate),
  play: () => e.invoke(n.play),
  openExternal: (r) => e.invoke(n.openExternal, r),
  onSyncProgress: (r) => {
    const t = (a, s) => r(s);
    return e.on(n.syncProgress, t), () => e.removeListener(n.syncProgress, t);
  },
  onUpdateProgress: (r) => {
    const t = (a, s, o) => r(s, o);
    return e.on(n.updateProgress, t), () => e.removeListener(n.updateProgress, t);
  }
};
c.exposeInMainWorld("launcher", p);
