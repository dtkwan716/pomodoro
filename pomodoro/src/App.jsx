import { useState, useEffect } from 'react'
import Timer from './components/timer'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isReset, setIsReset] = useState(false)
  return (
    <div>
      <h1>Domodoro Timer</h1>
      <Timer isRunning={isRunning} isReset={isReset}/>
      <button onClick={() => {setIsRunning(true); setIsReset(false);}}> Start Session </button>
      <button onClick={() => setIsRunning(false)}> Stop Session </button>
      <button onClick={() => {
        setIsRunning(false);
        setIsReset(true);
      }}>
        Reset Session
      </button>
    </div>
  ) 
}

export default App
