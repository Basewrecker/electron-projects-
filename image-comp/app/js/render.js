const path = require('path');
const os = require('os');

const form = document.getElementById('image-form');
const slider = document.getElementById('slider');
const outputPath = document.getElementById('output-path');

outputPath.innerHTML = path.join(os.homedir(), 'imageshrink');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const img = document.querySelector('#img');
    const file = img.files[0];

 

    const imgPath = file.path;
    const quality = slider.value;

    console.log('Image Path:', imgPath);
    console.log('Quality:', quality);
    console.log('full file:', file);
console.log('path:', file.path);
console.log('name:', file.name);
});