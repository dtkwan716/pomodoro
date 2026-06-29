import { useState, useEffect } from 'react'
import Timer from './components/timer'
import Camera from './components/camera'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isReset, setIsReset] = useState(false)
  return (
    <div>
      <h1>Domodoro Timer</h1>
      <Timer isRunning={isRunning} isReset={isReset}/>
      <button onClick={() => {setIsRunning(true); setIsReset(false);}}> {isReset ? "Start Session" : "Continue Session"} </button>
      <button onClick={() => setIsRunning(false)}> Stop Session </button>
      <button onClick={() => {
        setIsRunning(false);
        setIsReset(true);
      }}>
        Reset Session
      </button>
      <Camera />
    </div>
  ) 
}

export default App
