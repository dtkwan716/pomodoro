import React, {useState, useEffect, useRef} from 'react';
import { FilesetResolver, FaceDetector, DrawingUtils, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision';


const Camera = ({ setIsFaceDetected, setIsGestureDetected }) => {
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const lastFaceCheck = useRef(0);
    const lastGestureCheck = useRef(0);
    const faceDetector = useRef(null);
    const faceResults = useRef(null);
    const gestureResults = useRef(null);
    const canvasRef = useRef(null);
    const gestureRecognizer = useRef(null);

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
                setIsFaceDetected(-1);
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
        
        gestureRecognizer.current = await GestureRecognizer.createFromOptions(
            vision, 
            {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
            },  
            runningMode:"VIDEO",
            numHands: 1
            });
            renderLoop();
        }
        initFaceDetector();
        console.log("Face detector works");
        }, [])

    //The loop the call FaceDetector every frame
    function renderLoop(timestamp) {
        const video = videoRef.current;

        if (!video ||  video.readyState < 2) {
            requestAnimationFrame(renderLoop);
            return;
        }

        if (timestamp - lastFaceCheck.current >= 200){
            faceResults.current =  faceDetector.current.detectForVideo(video, timestamp);

            lastFaceCheck.current = timestamp;
        }

        if (gestureRecognizer.current && timestamp - lastGestureCheck.current >= 400){
            gestureResults.current = gestureRecognizer.current.recognizeForVideo(video, timestamp);

            lastGestureCheck.current = timestamp;
        }

        if(faceResults.current) setIsFaceDetected(faceResults.current.detections.length);  
        if(gestureResults.current?.gestures?.[0]?.[0]?.categoryName == "Closed_Fist") {
            setIsGestureDetected(true);
        } else {
            setIsGestureDetected(false);
        }
        drawResults(faceResults.current, gestureResults.current);
        if (gestureResults.current?.gestures?.[0]?.[0]?.categoryName === "Thumb_Up"){
            console.log("ITS WORKING HAHAA");
        }
        requestAnimationFrame(renderLoop);
    }

    //Draws the Box
    function drawResults(faceresults, gestureresults){
        const canvas = canvasRef.current;
        if(!canvas){
            console.log("Canvas not ready");
            return;
        }

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawingUtils = new DrawingUtils(ctx);



        if (!faceresults?.detections?.length) return;

        for (const detection of faceresults.detections) {
            drawingUtils.drawBoundingBox(detection.boundingBox, {color: 'green', lineWidth: 4, fillColor: 'transparent'});
        }

        for (const landmarks of gestureresults.landmarks) {
            drawingUtils.drawConnectors(
                landmarks,
                HandLandmarker.HAND_CONNECTIONS,
                {color: "lime", lineWidth: 3}
            );

            drawingUtils.drawLandmarks(
                landmarks,
                {color: "red", radius: 3}
            );
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

