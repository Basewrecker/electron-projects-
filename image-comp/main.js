const { app, BrowserWindow, Menu, globalShortcut } = require("electron");

process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageComp",
    width: 500,
    height: 600,
    icon: '${__dirname}/assets/icons/Icon_256x256.png',
    resizable: isDev ? true : false
  });
  mainWindow.loadFile('./app/index.html');
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About",
    width: 200,
    height: 300,
    icon: '${__dirname}/assets/icons/Icon_256x256.png',
    resizable: isDev ? true : false
  });
  aboutWindow.loadFile('./app/about.html');
}

// Pre defining a menu (shifting with the spread)

const menu = [
  ...(isMac ? [
    {
      label: app.name,
      submenu: [
        {
          label: 'About',
          click: createAboutWindow
        }
      ]
    },
  ]: []),
  {
    role: 'fileMenu',
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
    ]
  }, 
  ...(isDev ? [
    {
      label: 'Debug',
      submenu: [
        {role: 'reload'},
        {role: 'forceReload'},
        {type: 'separator'},
        {role: 'toggleDevTools'},
      ]
    }
  ]: []),
  
]


app.on("ready", () => {
  createMainWindow()

  // Passing the menu params 

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
  // globalShortcut.register('CmdOrCtrl+R', () => {
  //   mainWindow.reload();
  // });
  // globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () => {
  //   mainWindow.toggleDevTools();
  // })

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})