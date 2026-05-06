const { app, BrowserWindow } = require("electron");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageComp",
    width: 500,
    height: 600,
    icon: '${__dirname}/assets/icons/Icon_256x256.png',
  });

  
  mainWindow.loadFile('./app/index.html');
}

app.on("ready", createMainWindow);
