import { contextBridge as c, ipcRenderer as r } from "electron";
const o = {
  listProjects: "projects:list",
  getProject: "projects:get",
  createProject: "projects:create",
  saveProject: "projects:save",
  pickFolder: "dialog:pickFolder",
  pickImage: "dialog:pickImage",
  detectServer: "server:detect",
  readServerConfig: "server:readConfig",
  build: "build:run",
  publish: "publish:run",
  openOutput: "output:open",
  buildProgress: "build:progress",
  supportedGames: "games:supported"
}, p = {
  listProjects: () => r.invoke(o.listProjects),
  getProject: (e) => r.invoke(o.getProject, e),
  createProject: (e) => r.invoke(o.createProject, e),
  saveProject: (e) => r.invoke(o.saveProject, e),
  pickFolder: () => r.invoke(o.pickFolder),
  pickImage: () => r.invoke(o.pickImage),
  detectServer: (e, t) => r.invoke(o.detectServer, e, t),
  readServerConfig: (e, t) => r.invoke(o.readServerConfig, e, t),
  build: (e) => r.invoke(o.build, e),
  publish: (e, t, i) => r.invoke(o.publish, e, t, i),
  openOutput: (e) => r.invoke(o.openOutput, e),
  supportedGames: () => r.invoke(o.supportedGames),
  onBuildProgress: (e) => {
    const t = (i, s) => e(s);
    return r.on(o.buildProgress, t), () => r.removeListener(o.buildProgress, t);
  }
};
c.exposeInMainWorld("forgelink", p);
