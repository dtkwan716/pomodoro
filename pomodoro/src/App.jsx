import { useState, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import Timer from './components/timer'
import Camera from './components/camera'
import {ToastContainer, toast, Slide} from 'react-toastify'
import './App.css'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isReset, setIsReset] = useState(true)
  const [isFaceDetected, setIsFaceDetected] = useState(false)
  const [isNotifOn, setIsNotifOn] = useState(false)
  const breakNotif = () => {
    if (!isNotifOn) return;
    toast.success("Good Job, Time for a break!", {autoClose: 2000});
  };
  const workNotif = () => {
    if (!isNotifOn) return;
    toast.warning("Break is over get back to work.", {autoClose: 2000});
  };

  return (
    <div>
      <h1>Domodoro Timer</h1>
      <Timer isRunning={isRunning} isReset={isReset} isFaceDetected={isFaceDetected} notif={{break: breakNotif, work: workNotif}} isNotifOn={isNotifOn}/>

      <button onClick={() => {setIsRunning(true); setIsReset(false);}}> {isReset ? "Start Session" : "Continue Session"} </button>

      <button onClick={() => setIsRunning(false)}> Stop Session </button>

      <button onClick={() => {
        setIsRunning(false);
        setIsReset(true);
      }}>
        Reset Session
      </button>

      <input 
      className="react-switch-checkbox" 
      id={`react-switch-new`}
      type="checkbox"
      onChange={() => setIsNotifOn(!isNotifOn)}
      />
      <label 
        style={{ background: isNotifOn ? '#06ac5b' : '#4a4a4a' }}
        className="react-switch-label" 
        htmlFor={`react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
      <span>Allow Notifications?</span>

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
