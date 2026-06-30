import { useState, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import Timer from './components/timer'
import Camera from './components/camera'
import {ToastContainer, toast, Slide} from 'react-toastify'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isReset, setIsReset] = useState(true)
  const [isFaceDetected, setIsFaceDetected] = useState(false)
  const breakNotif = () => toast.success("Good Job, Time for a break!", {autoClose: 2000});
  const workNotif = () => toast.warning("Break is over get back to work.", {autoClose: 2000});


  return (
    <div>
      <h1>Domodoro Timer</h1>
      <Timer isRunning={isRunning} isReset={isReset} isFaceDetected={isFaceDetected} notif={{break: breakNotif, work: workNotif}}/>
      <button onClick={() => {setIsRunning(true); setIsReset(false);}}> {isReset ? "Start Session" : "Continue Session"} </button>
      <button onClick={() => setIsRunning(false)}> Stop Session </button>
      <button onClick={() => {
        setIsRunning(false);
        setIsReset(true);
      }}>
        Reset Session
      </button>
      <Camera setIsFaceDetected={setIsFaceDetected} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        transition={Slide} 
      />
    </div>
  ) 
}

export default App
