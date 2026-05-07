const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog, shell } = require('electron');
const imagemin = require('imagemin')
const imageMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash');
const log = require('electron-log')

process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let aboutWzindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageComp",
    width: isDev ? 700 : 500,
    height: 600,
    icon: '${__dirname}/assets/icons/Icon_256x256.png',
    resizable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.loadFile('./app/index.html');
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About",
    width: 200,
    height: 300,
    icon: '${__dirname}/assets/icons/Icon_256x256.png',
    resizable: false,
  });
  aboutWindow.loadFile('./app/about.html');
}

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
  { role: 'fileMenu' },
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


ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
  });
  return result.cancelled ? null : result.filePaths[0];
});


ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink')
  shrinkImage(options)
});

async function shrinkImage({imgPath, quality, dest}) {
  try {
    console.log('Starting compression...');
    console.log('imgPath:', imgPath);
    console.log('quality:', quality);
    console.log('dest:', dest);
    
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageMozjpeg({quality}),
        imageminPngquant({
          quality: [pngQuality, pngQuality]
        })
      ]
    })
    
    log.info(files)
    shell.openPath(dest)
    mainWindow.webContents.send('image:done')
    console.log('Error:', err)
  } catch (err) {
    
    log.error(err)
  }
}


app.on("ready", () => {
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

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