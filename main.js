"use strict";

import "./style.css";

const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");

canvasContext.fillStyle = "green";
canvasContext.fillRect(10, 10, 150, 100);

const fileInput = document.querySelector("#fileInput");
console.log(fileInput.files.length);

fileInput.addEventListener(
    "change",
    async () => {
        const fileList = fileInput.files;
        const imageBitmap = await createImageBitmap(fileList[0]);
        canvasContext.drawImage(imageBitmap, 0, 0);
    },
    false
);

