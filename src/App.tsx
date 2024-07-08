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
    const baseBrush = useRef<ImageData | null>(null);

    // console.log("render")

    const getImageDataIndex = (x: number, y: number, width: number) => {
        return y * (width * 4) + x * 4;
    };

    if (baseBrush.current === null) {
        const pattern = [
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
        ]
        baseBrush.current = new ImageData(5, 5);
        const canvasContext = canvasRef.current?.getContext("2d");
        const newData = canvasContext?.createImageData(5, 5)
        if (newData !== undefined) {
            console.log("heref")
            baseBrush.current = newData;
        }
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[0].length; x++) {
                if (pattern[y][x] === 1) {
                    const baseIndex = getImageDataIndex(x, y, 5);
                    baseBrush.current.data[baseIndex] = 255;
                    baseBrush.current.data[baseIndex + 1] = 0;
                    baseBrush.current.data[baseIndex + 2] = 0;
                    baseBrush.current.data[baseIndex + 3] = 255;
                }
            }
        }
    }

    // Returns the first index for pixel at x, y
    // With the following three indices you have RGBA
   
    // const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;
    const getColorIndicesForCoord = (x, y) => {
        if (!width) return;
        const red = y * (width * 4) + x * 4;
        return [red, red + 1, red + 2, red + 3];
    };


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
        // TODO image leaves behind fragments when decreasing scale.
        if (image !== undefined) {
            canvasContext?.drawImage(image, 0, 0);
        }
        // TODO line is rendered twice on initial stroke due to being handles both in 
        console.log("layout called")
        if (baseBrush.current !== null) {
            console.log(baseBrush.current);
            canvasContext?.putImageData(baseBrush.current, 0, 0);
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [scale, image, handleResize, width, height]);


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

    const canvasPointerDown = (event: React.PointerEvent)=> {
        setDrawing(true);
        const canvasContext = canvasRef.current?.getContext("2d");
        const { offsetX, offsetY } = event.nativeEvent;
        // TODO make this a function
        // TODO there are likely edge cases I need to take care of when adding the brush
        // Partial Opacity brushes should be added in some way
        // Try NewColor = ColorTop * colorTopAlpha + ColorBottom * (1.0 - colorTopAlpha)
        drawAtPoint(offsetX, offsetY)
        // if (baseBrush.current !== null) {
        //     // 5, 5 for brush size
        //     const previousData = canvasContext?.getImageData(offsetX, offsetY, 5, 5)
        //     if (previousData !== undefined) {
        //         for (let i = 0; i < previousData.data.length; i = i + 4) {
        //             if (baseBrush.current.data[i + 3] !== 0) {
        //                 // OverWrite previous data with brush data brush isnt opaque on that spot
        //                 previousData.data[i] = baseBrush.current.data[i]
        //                 previousData.data[i + 1] = baseBrush.current.data[i + 1]
        //                 previousData.data[i + 2] = baseBrush.current.data[i + 2]
        //                 previousData.data[i + 3] = baseBrush.current.data[i + 3]
        //             }
        //         }
        //         // TODO make placement of brush stroke centered on pointer not with top left corners
        //         canvasContext?.putImageData(previousData, offsetX, offsetY);
        //     }
        // }
    }

    const canvasPointerMove = (event: React.PointerEvent) => {
        if (drawing) {
            const coalesced = event.nativeEvent.getCoalescedEvents();
            for (const point of coalesced) {
                drawAtPoint(point.offsetX, point.offsetY)
            }
        }
    }

    const canvasPointerUp = (event: React.PointerEvent) => {
        setDrawing(false);
    }

    const drawAtPoint = async (offsetX, offsetY) => {
        console.log("in async")
        const canvasContext = canvasRef.current?.getContext("2d");
        if (baseBrush.current !== null) {
            const centeredX = offsetX - baseBrush.current.width / 2;
            const centeredY = offsetY - baseBrush.current.height / 2;
            const previousData = canvasContext?.getImageData(centeredX, centeredY, 5, 5);
            if (previousData !== undefined) {
                for (let i = 0; i < previousData.data.length; i = i + 4) {
                    if (baseBrush.current.data[i + 3] !== 0) {
                        // OverWrite previous data with brush data brush isnt opaque on that spot
                        previousData.data[i] = baseBrush.current.data[i]
                        previousData.data[i + 1] = baseBrush.current.data[i + 1]
                        previousData.data[i + 2] = baseBrush.current.data[i + 2]
                        previousData.data[i + 3] = baseBrush.current.data[i + 3]
                    }
                }
                canvasContext?.putImageData(previousData, centeredX, centeredY);
            }
        }
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
                    onPointerDown={canvasPointerDown}
                    onPointerMove={canvasPointerMove}
                    onPointerUp={canvasPointerUp}
                >
                    Canvas
                </canvas>
            </div>
            <div className="tools">
                <label className="btn uploadButton">
                    <input onChange={handleFileUpload} type="file" accept="image/*" className="fileUpload" />
                    <p>Upload File</p>
                </label>
                <button
                    onClick={() => {
                        setScale(Math.max(scale - 0.1, 0.1));
                    }}
                    className="btn"
                >
                    -
                </button>
                <p className="displayScale">{"Scale: " + scale.toFixed(1)}</p>
                <button
                    onClick={() => {
                        setScale(scale + 0.1);
                    }}
                    type="button"
                    className="btn"
                >
                    +
                </button>
                <input type="color" onChange={handleColorPicker} />
                <p>Line Width: </p>
                <input type="number" onChange={handleLineWidthChange} min={1} />
                <button onClick={download} className="btn">Download</button>
            </div>
        </div>
    );
}

export default App;
