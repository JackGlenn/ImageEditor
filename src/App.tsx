import { useState, useLayoutEffect, useRef, useCallback } from "react";
// import "./App.css";

function App() {
    // const [count, setCount] = useState(0)
    const [scale, setScale] = useState<number>(1);
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<ImageBitmap>();
    // const [color, setColor] = useState()
    const [drawing, setDrawing] = useState<boolean>(false)
    // const [lineWidth, setLineWidth] = useState()


    const handleResize = useCallback(() => {
        const style = canvasRef.current?.getBoundingClientRect();
        setWidth(style?.width);
        setHeight(style?.height);
        // console.log(width, height)
    }, []);

    useLayoutEffect(() => {
        const style = canvasRef.current?.getBoundingClientRect();
        setWidth(style?.width);
        setHeight(style?.height);
        const canvasContext = canvasRef.current?.getContext("2d");
        // canvasContext?.clearRect(0, 0, width ?? 100, height ?? 100);
        canvasContext?.reset()
        canvasContext?.resetTransform();
        canvasContext?.scale(scale, scale);
        if (image !== undefined) {
            canvasContext?.drawImage(image, 0, 0);
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [scale, image, handleResize]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const img = await createImageBitmap(event.target.files?.[0] as Blob);
        setImage(img);
    };

    const canvasMouseDown = (event: React.MouseEvent) => {
        setDrawing(true)
        const canvasContext = canvasRef.current?.getContext("2d");
        const {offsetX, offsetY} = event.nativeEvent;
        // console.log("mouse down: ", offsetX, offsetY)
        // canvasContext?.beginPath(event.targetoffsetX)

        canvasContext?.beginPath()
        canvasContext?.moveTo(offsetX, offsetY)
        canvasContext?.lineTo(offsetX, offsetY)
    };

    const canvasMouseMove = (event: React.MouseEvent) => {
        if(drawing) {
            const canvasContext = canvasRef.current?.getContext("2d");
            const {offsetX, offsetY} = event.nativeEvent;
            canvasContext?.lineTo(offsetX, offsetY)
            canvasContext?.moveTo(offsetX, offsetY);
            // console.log("mouse move: ", offsetX, offsetY)
        }
    };

    const canvasMouseUp = () => {
        setDrawing(false)
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.stroke()
        // console.log("mouse up");
    };

    const handleColorPicker = (event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(event.target.value)
        // console.log(typeof event.target.value)
        const canvasContext = canvasRef.current?.getContext("2d");
        if (canvasContext) {
            canvasContext.strokeStyle = event.target.value;
        }
    }

    const handleLineWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // setLineWidth
        const canvasContext = canvasRef.current?.getContext("2d");
        if (canvasContext) {
            // ToDo maybe float?
            canvasContext.lineWidth = parseInt(event.target.value);
        }
    }

    const download = () => {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        const downloadUrl = canvasRef?.current?.toDataURL()
        if (downloadUrl) {
            link.href = downloadUrl
        }
        link.click();
    }

    return (
        <div className="app">
            <div className="canvasHolder">
                <canvas
                    id="canvas"
                    ref={canvasRef}
                    height={height}
                    width={width}
                    onMouseDown={canvasMouseDown}
                    onMouseMove={canvasMouseMove}
                    onMouseUp={canvasMouseUp}
                >
                    Canvas
                </canvas>
            </div>
            <div className="tools">
                <input onChange={handleFileUpload} type="file" accept="image/*" className="uploadButton" />
                <button
                    onClick={() => {
                        setScale(Math.max(scale - 0.1, 0.1));
                    }}
                    className="decreaseScale"
                >
                    -
                </button>
                <p className="displayScale">{"Scale: " + scale.toFixed(1)}</p>
                <button
                    onClick={() => {
                        setScale(scale + 0.1);
                    }}
                    type="button"
                    className="increaseScale"
                >
                    +
                </button>
                <input type="color" onChange={handleColorPicker}/>
                <p>Line Width: </p>
                <input type="number" onChange={handleLineWidthChange} min={1}/>
                <button onClick={download}>Download</button>
            </div>
        </div>
    );
}

export default App;
