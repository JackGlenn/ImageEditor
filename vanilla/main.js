"use strict";

import "./style.css";

const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");

let currentScale = 1;
const fileInput = document.querySelector("#fileInput");
const scaleDisplay = document.querySelector("#scale");

scaleDisplay.textContent = "Scale: "+currentScale;

canvasContext.fillStyle = "green";
canvasContext.fillRect(10, 10, 150, 100);

let imageBitmap;

function render() {
    // TODO use get image data when resizing to for re rendering
    const computedStyle = getComputedStyle(canvas);
    const width = parseFloat(computedStyle.getPropertyValue("width"));
    const height = parseFloat(computedStyle.getPropertyValue("height"));
    // console.log(canvasContext.canvas.width, canvasContext.canvas.height)
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.scale(currentScale, currentScale);
    if (typeof imageBitmap !== "undefined") {
        canvasContext.drawImage(imageBitmap, 0, 0);
    }
}

fileInput.addEventListener(
    "change",
    async () => {
        const fileList = fileInput.files;
        imageBitmap = await createImageBitmap(fileList[0]);
        render();
    },
    false
);



function setCanvasScale() {
    document.querySelector("#scale").textContent = "Scale: " + currentScale.toFixed(1);
}

const scaleDown = document.querySelector("#scaleDown");
const scaleUp = document.querySelector("#scaleUp");

scaleUp.addEventListener("click", () => {
    currentScale += 0.1;
    setCanvasScale();
    render();
});

scaleDown.addEventListener("click", () => {
    currentScale = Math.max(currentScale - 0.1, 0.1);
    setCanvasScale();
    render();
});
