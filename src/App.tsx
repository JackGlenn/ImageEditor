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
    const [drawing, setDrawing] = useState<boolean>(false);
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
        canvasContext?.clearRect(0, 0, width ?? 100, height ?? 100);
        // canvasContext?.reset()
        canvasContext?.resetTransform();
        canvasContext?.scale(scale, scale);
        if (image !== undefined) {
            canvasContext?.drawImage(image, 0, 0);
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [width, height, scale, image, handleResize]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const img = await createImageBitmap(event.target.files?.[0] as Blob);
        setImage(img);
    };

    const canvasMouseDown = (event: React.MouseEvent) => {
        setDrawing(true);
        const canvasContext = canvasRef.current?.getContext("2d");
        const { offsetX, offsetY } = event.nativeEvent;
        // console.log("mouse down: ", offsetX, offsetY)
        // canvasContext?.beginPath(event.targetoffsetX)

        canvasContext?.beginPath();
        canvasContext?.moveTo(offsetX, offsetY);
        canvasContext?.lineTo(offsetX, offsetY);
    };

    const canvasTouchStart = (event: React.TouchEvent) => {
        event.preventDefault();
        // TODO this code is too similar to canvas touch move
        setDrawing(true);
        const canvasContext = canvasRef.current?.getContext("2d");
        const touches = event.changedTouches;
        const { clientX, clientY } = touches[0];
        const boundingRect = canvasRef?.current?.getBoundingClientRect();
        if (boundingRect) {
            const realX = clientX - boundingRect.left;
            const realY = clientY - boundingRect.top;
            canvasContext?.beginPath();
            canvasContext?.moveTo(realX, realY);
            canvasContext?.lineTo(realX, realY);
        }
    };

    const canvasMouseMove = (event: React.MouseEvent) => {
        if (drawing) {
            const canvasContext = canvasRef.current?.getContext("2d");
            const { offsetX, offsetY } = event.nativeEvent;
            canvasContext?.lineTo(offsetX, offsetY);
            canvasContext?.moveTo(offsetX, offsetY);
            canvasContext?.stroke();

            // console.log("mouse move: ", offsetX, offsetY)
        }
    };

    const canvasTouchMove = (event: React.TouchEvent) => {
        event.preventDefault();
        if (drawing) {
            const canvasContext = canvasRef.current?.getContext("2d");
            const touches = event.changedTouches;
            const { clientX, clientY } = touches[0];
            const boundingRect = canvasRef?.current?.getBoundingClientRect();
            if (boundingRect) {
                const realX = clientX - boundingRect.left;
                const realY = clientY - boundingRect.top;
                canvasContext?.lineTo(realX, realY);
                canvasContext?.moveTo(realX, realY);
                canvasContext?.stroke();
            }
        }
    };

    const canvasMouseUp = () => {
        // TODO moving mouse off canvas and picking up doesnt end stroke.
        setDrawing(false);
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.stroke();
        // console.log("mouse up");
    };

    const canvasTouchEnd = (event: React.TouchEvent) => {
        event.preventDefault();
        //TODO this is the same as for canvas
        setDrawing(false);
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.stroke();
    };

    const handleColorPicker = (event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(event.target.value)
        // console.log(typeof event.target.value)
        const canvasContext = canvasRef.current?.getContext("2d");
        if (canvasContext) {
            canvasContext.strokeStyle = event.target.value;
        }
    };

    const handleLineWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // setLineWidth
        const canvasContext = canvasRef.current?.getContext("2d");
        if (canvasContext) {
            // ToDo maybe float?
            canvasContext.lineWidth = parseInt(event.target.value);
        }
    };

    const download = () => {
        const link = document.createElement("a");
        link.download = "drawing.png";
        const downloadUrl = canvasRef?.current?.toDataURL();
        if (downloadUrl) {
            link.href = downloadUrl;
        }
        link.click();
    };

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
                    onTouchStart={canvasTouchStart}
                    onTouchMove={canvasTouchMove}
                    onTouchEnd={canvasTouchEnd}
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
                <input type="color" onChange={handleColorPicker} />
                <p>Line Width: </p>
                <input type="number" onChange={handleLineWidthChange} min={1} />
                <button onClick={download}>Download</button>
            </div>
        </div>
    );
}

export default App;
