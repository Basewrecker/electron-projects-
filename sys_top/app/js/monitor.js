const path = require("path");
const nodeOs = require("os");
const { CPUMonitor, MemoryMonitor, SystemMonitor } = require("node-os-utils");
const { ipcRenderer } = require("electron");
const cpu = new CPUMonitor();
const mem = new MemoryMonitor();
const os = new SystemMonitor();

let cpuOverload;
let alertFrequency;

ipcRenderer.on("settings:get", (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});

function getCpuUsage() {
  return new Promise((resolve) => {
    const cpus1 = nodeOs.cpus();
    setTimeout(() => {
      const cpus2 = nodeOs.cpus();
      let totalIdle = 0,
        totalTick = 0;
      cpus1.forEach((_, i) => {
        const t1 = cpus1[i].times;
        const t2 = cpus2[i].times;
        for (const type in t2) totalTick += t2[type] - t1[type];
        totalIdle += t2.idle - t1.idle;
      });
      resolve((100 - (100 * totalIdle) / totalTick).toFixed(1));
    }, 200);
  });
}

// Run every 1.5 seconds
setInterval(() => {
  getCpuUsage().then((usage) => {
    document.getElementById("cpu-usage").innerText = usage + "%";
    document.getElementById("cpu-free").innerText =
      (100 - usage).toFixed(1) + "%";
    document.getElementById("cpu-progress").style.width = usage + "%";
    if (usage > cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }
  });

  // Check overload
  if (info >= cpuOverload && runNotify(alertFrequency)) {
    notifyUser({
      title: "CPU overload",
      body: `Cpu is over ${cpuOverload}`,
      icon: path.join(__dirname, "img", "./icon.png"),
    });

    localStorage.setItem("lastNotify", +new Date());
  }
}, 1500);

// Format uptime date time format

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${second}s`;
}

document.getElementById("cpu-model").innerText = cpu.model();
document.getElementById("comp-name").innerText = nodeOs.hostname();
document.getElementById("os").innerText = `${nodeOs.type()} ${nodeOs.arch()}`;
document.getElementById("sys-uptime").innerText = formatUptime(nodeOs.uptime());
document.getElementById("mem-total").innerText =
  (nodeOs.totalmem() / 1024 / 1024 / 1024).toFixed(1) + " GB";

// Send notification

function notifyUser(options) {
  new Notification(options.title, options);
}

function runNotify(frequency) {
  if (localStorage.getItem("lastNotify") === null) {
    localStorage.setItem("lastNotify", +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
}
