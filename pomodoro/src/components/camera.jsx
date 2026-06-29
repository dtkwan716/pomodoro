import React, {useState, useEffect, useRef} from 'react';
import { FilesetResolver, FaceDetector, DrawingUtils } from '@mediapipe/tasks-vision';


const Camera = ({ setIsFaceDetected }) => {
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const lastVideoTime = useRef(-1);
    const faceDetector = useRef(null);
    const results = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const getVideo = async () => { 
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                console.log("Camera works");
            }
            catch (err) {
                setError("Camera could not be accessed.");
            }
        }
        getVideo();
    }, []);
    
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
            setIsFaceDetected(results.current.detections.length > 0);
            console.log(results.current);
            

            lastVideoTime.current = video.currentTime;  
        }
        drawResults(results.current);
        requestAnimationFrame(() => {
            renderLoop();
        });
    }

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
        console.log(canvas.width, canvas.height, videoRef.current.videoWidth, videoRef.current.videoHeight);
    }



        return (
            <div style={{position: "relative", width: "fit-content"}}>
                {error && <p>{error}</p>}
                <video 
                    ref={videoRef} 
                    autoPlay
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

