const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');

const form = document.getElementById('image-form');
const slider = document.getElementById('slider');
const outputPath = document.getElementById('output-path');

outputPath.innerHTML = path.join(os.homedir(), 'imageshrink');

let selectedFilePath = null;

// Intercept Browse button click to open native dialog
document.querySelector('.file-field .btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const filePath = await ipcRenderer.invoke('select-file');
    if (filePath) {
        selectedFilePath = filePath;
        document.querySelector('.file-path').value = path.basename(filePath);
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!selectedFilePath) {
        alert('Please select an image first.');
        return;
    }

    const quality = slider.value;

    console.log('Image Path:', selectedFilePath);
    console.log('Quality:', quality);

    ipcRenderer.send('image:minimize', {
        imgPath: selectedFilePath,
        quality
    });
});

ipcRenderer.on('image:done', () => {
    M.toast({
        html: `Image resized to ${slider.value}% quality`,
    })
})