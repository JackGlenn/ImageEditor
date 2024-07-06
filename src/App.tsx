import { useState, useLayoutEffect, useRef } from "react";
// import "./App.css";

function App() {
    // const [count, setCount] = useState(0)
    const [scale, setScale] = useState(1); 
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<ImageBitmap>();

    useLayoutEffect(()=> {
        const style = canvasRef.current?.getBoundingClientRect()
        setWidth(style?.width)
        setHeight(style?.height)
        console.log(width, height)
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.clearRect(0, 0, width, height);
        canvasContext?.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext?.scale(scale, scale);
        if (image !== undefined) {
            canvasContext?.drawImage(image, 0, 0);
        }
    },[width, height, scale, image])

    const handleFileUpload = async (event)=> {
        const img = await createImageBitmap(event.target.files[0])
        setImage(img);
    }

    return (
        <div className="app">
            <div className="canvasHolder">
            <canvas id="canvas" ref={canvasRef} height={height} width={width}>Canvas</canvas>
            </div>
            <div className="tools">
                <input onChange={handleFileUpload} type="file" accept="image/*"/>
                <button onClick={()=> {setScale(Math.max(scale - 0.1, 0.1))}}>-</button>
                <p id="scale">{scale.toFixed(1)}</p>
                <button onClick={()=>{setScale(scale + 0.1)}} type="button">+</button>
            </div>
        </div>
    );
}

export default App;
