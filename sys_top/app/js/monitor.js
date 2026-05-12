const path = require('path');
const { CPUMonitor, MemoryMonitor, SystemMonitor } = require('node-os-utils');
const cpu = new CPUMonitor()
const mem = new MemoryMonitor()
const os = new SystemMonitor()

document.getElementById('cpu-model').innerText = cpu.model()