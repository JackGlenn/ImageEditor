import { useState, useLayoutEffect, useRef, useCallback } from "react";
// import "./App.css";

function App() {
    // const [count, setCount] = useState(0)
    const [scale, setScale] = useState<number>(1); 
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<ImageBitmap>();

    const handleResize = useCallback(()=> {
        const style = canvasRef.current?.getBoundingClientRect()
        setWidth(style?.width)
        setHeight(style?.height)
        // console.log(width, height)
    }, [])

    useLayoutEffect(()=> {
        const style = canvasRef.current?.getBoundingClientRect()
        setWidth(style?.width)
        setHeight(style?.height)
        console.log(width, height)
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.clearRect(0, 0, width ?? 100, height ?? 100);
        canvasContext?.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext?.scale(scale, scale);
        if (image !== undefined) {
            canvasContext?.drawImage(image, 0, 0);
        }

        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    },[width, height, scale, image, handleResize])

    const handleFileUpload = async(event:React.ChangeEvent<HTMLInputElement>)=> {
        const img = await createImageBitmap(event.target.files?.[0] as Blob)
        setImage(img);
    }

    return (
        <div className="app">
            <div className="canvasHolder">
            <canvas id="canvas" ref={canvasRef} height={height} width={width}>Canvas</canvas>
            </div>
            <div className="tools">
                <input onChange={handleFileUpload} type="file" accept="image/*" className="uploadButton"/>
                <button onClick={()=> {setScale(Math.max(scale - 0.1, 0.1))}} className="decreaseScale">-</button>
                <p className="displayScale">{scale.toFixed(1)}</p>
                <button onClick={()=>{setScale(scale + 0.1)}} type="button" className="increaseScale">+</button>
            </div>
        </div>
    );
}

export default App;
