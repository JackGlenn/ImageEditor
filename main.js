import './style.css'

const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");

canvasContext.fillStyle = "green";
canvasContext.fillRect(10, 10, 150, 100);
