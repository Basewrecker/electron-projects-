const { app, BrowserWindow, Menu, Tray } = require("electron");
const path = require("path");
const log = require("electron-log");
const Store = require("./Store");
const { ipcMain } = require("electron/main");

// Set env
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let tray;

const store = new Store({
  configName: "user-settings",
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "SysTop",
    width: isDev ? 700 : 355,
    height: 600,
    icon: "./assets/icons/icon.png",
    show: false,
    opacity: 0.9,
    resizable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile("./app/index.html");
}

app.on("ready", () => {
  createMainWindow();

  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings:get", store.get("settings"));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
    return true;
  });

  const icon = path.join(__dirname, "assets", "icons", "tray_icon.png");

  tray = new Tray(icon);
  tray.on("click", () => {
    if (mainWindow.isVisible() === true) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
    tray.on("right-click", () => {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Quit",
          click: () => {
            app.isQuitting = true;
            app.quit();
          },
        },
      ]);
      tray.popUpContextMenu(contextMenu);
    });
  });

  mainWindow.on("ready", () => (mainWindow = null));
});

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  {
    label: "View",
    submenu: [
      {
        label: "Toggle Navigation",
        click: () => mainWindow.webContents.send("nav:toggle"),
      },
      {
        label: "Toggle Hostname",
        click: () => mainWindow.webContents.send("comp-name:toggle"),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// Set settings

ipcMain.on("settings:set", (e, value) => {
  store.set("settings", value);
  mainWindow.webContents.send("settings:get", store.get("settings"));
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
