import { useState, useLayoutEffect, useRef, useCallback } from "react";
// import "./App.css";

type Line = {
    lineWidth: number;
    color: string;
    points: {
        x: number;
        y: number;
    }[];
}

function App() {
    // const [count, setCount] = useState(0)
    const [scale, setScale] = useState<number>(1);
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<ImageBitmap>();
    const [color, setColor] = useState<string>("#000000");
    const [drawing, setDrawing] = useState<boolean>(false);
    const [lineWidth, setLineWidth] = useState<number>(1)
    const [lines, setLines] = useState<Line[]>([])

    const handleResize = useCallback(() => {
        const style = canvasRef.current?.getBoundingClientRect();
        setWidth(style?.width);
        setHeight(style?.height);
    }, []);

    useLayoutEffect(() => {
        const style = canvasRef.current?.getBoundingClientRect();
        setWidth(style?.width);
        setHeight(style?.height);
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.clearRect(0, 0, canvasRef.current?.width ?? 100, canvasRef.current?.height ?? 100);
        // canvasContext?.reset()
        canvasContext?.resetTransform();
        //TODO scale behaves oddly when smaller than 
        canvasContext?.scale(scale, scale);
        if (image !== undefined) {
            canvasContext?.drawImage(image, 0, 0);
        }
        // TODO line is rendered twice on initial stroke due to being handles both in 
        for (const line of lines) {
            canvasContext?.beginPath();
            if (canvasContext) {
                canvasContext.strokeStyle = line.color;
                canvasContext.lineWidth = line.lineWidth;
            } 
                
            for (const point of line.points) {
                canvasContext?.lineTo(point.x, point.y);
                canvasContext?.moveTo(point.x, point.y);
            }
            canvasContext?.stroke();
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [scale, image, handleResize, lines, width, height]);

    const startLine = (setLineWidth: number, clr: string, x: number, y: number) => {
        setLines((prevState: Line[])=> {
            const newLine: Line = {
                lineWidth: setLineWidth,
                color: clr,
                points: [{x, y}]
            };
            const lines = [...prevState, newLine];
            return lines;
        })
    }

    const addLinePoint = (x:number, y:number) => {
        setLines((prevState: Line[])=> {
            const newLines: Line[] = [...prevState];
            newLines[newLines.length - 1].points = [...newLines[newLines.length - 1].points, {x, y}];
            return newLines;
        })
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const img = await createImageBitmap(event.target.files?.[0] as Blob);
        setImage(img);
    };

    const canvasMouseDown = (event: React.MouseEvent) => {
        setDrawing(true);
        const canvasContext = canvasRef.current?.getContext("2d");
        const { offsetX, offsetY } = event.nativeEvent;
        // canvasContext?.beginPath(event.targetoffsetX)

        canvasContext?.beginPath();
        canvasContext?.moveTo(offsetX, offsetY);
        canvasContext?.lineTo(offsetX, offsetY);
        startLine(lineWidth, color, offsetX, offsetY);
    };

    const canvasTouchStart = (event: React.TouchEvent) => {
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

            addLinePoint(offsetX, offsetY);
        }
    };

    const canvasTouchMove = (event: React.TouchEvent) => {
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
        setDrawing(false);
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.stroke();
    };

    const canvasTouchEnd = () => {
        //TODO this is the same as for canvas
        setDrawing(false);
        const canvasContext = canvasRef.current?.getContext("2d");
        canvasContext?.stroke();
    };

    const canvasMouseLeave = (event: React.MouseEvent)=> {
        if (drawing) {
            const canvasContext = canvasRef.current?.getContext("2d");
            const { offsetX, offsetY } = event.nativeEvent;
            canvasContext?.lineTo(offsetX, offsetY);
            canvasContext?.moveTo(offsetX, offsetY);
            canvasContext?.stroke();

        }
        setDrawing(false);
    }

    const handleColorPicker = (event: React.ChangeEvent<HTMLInputElement>) => {
        const canvasContext = canvasRef.current?.getContext("2d");
        if (canvasContext) {
            canvasContext.strokeStyle = event.target.value;
        }
        setColor(event.target.value);
    };

    const handleLineWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLineWidth(parseInt(event.target.value));
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
                    onMouseLeave={canvasMouseLeave}
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
