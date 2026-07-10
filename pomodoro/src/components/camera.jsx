import React, {useState, useEffect, useRef} from 'react';
import { FilesetResolver, FaceDetector, DrawingUtils } from '@mediapipe/tasks-vision';


const Camera = ({ setIsFaceDetected }) => {
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const lastVideoTime = useRef(-1);
    const faceDetector = useRef(null);
    const results = useRef(null);
    const canvasRef = useRef(null);

    //Gets the Camera
    useEffect(() => {
        const getVideo = async () => { 
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setError(null);
            }
            catch (err) {
                setError("Camera could not be accessed.");
            }
        }
        getVideo();
        console.log("Camera works");
    }, []);

    //Creates the FaceDetector
    useEffect(() => {
        const initFaceDetector = async () => {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        
        faceDetector.current = await FaceDetector.createFromOptions(
            vision, 
            {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"
            },
            runningMode: "VIDEO"
            });
            renderLoop();
        }
        initFaceDetector();
        console.log("Face detector works");
    }, [])

    //The loop the call FaceDetector every frame
    function renderLoop() {
        const video = videoRef.current;
        console.log("Render loop started");

        if (!video || !faceDetector.current ||  video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(() => {
                renderLoop();
            });
            return;
        }
        if (video.currentTime !== lastVideoTime.current) {
            results.current = faceDetector.current.detectForVideo(video, performance.now());

        if(error === null) {
            setIsFaceDetected(results.current.detections.length);  
        } else {
            setIsFaceDetected(-1);
        }

        lastVideoTime.current = video.currentTime;  
        }
        drawResults(results.current);
        requestAnimationFrame(() => {
            renderLoop();
        });
    }

    //Draws the Box
    function drawResults(results){
        const canvas = canvasRef.current;
        if(!canvas){
            console.log("Canvas not ready");
            return;
        }

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawingUtils = new DrawingUtils(ctx);



        if (!results?.detections?.length) return;

        for (const detection of results.detections) {
            drawingUtils.drawBoundingBox(detection.boundingBox, {color: 'green', lineWidth: 4, fillColor: 'transparent'});
        }
    }

        return (
            <div style={{position: "relative", width: "fit-content"}}>
                {error && <p>{error}</p>}
                <video 
                    ref={videoRef} 
                    autoPlay
                    playsInline
                    muted
                    style={{width: "100%", height: "auto"}}
                    onLoadedMetadata={() => {
                        const video = videoRef.current;
                        const canvas = canvasRef.current;

                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }}
                ></video>
                <canvas ref={canvasRef} 
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        }}
                />
            </div>
        )
}   



    export default Camera;

