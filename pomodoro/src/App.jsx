import { useState, useEffect } from 'react'



const Timer = ({isRunning}) => {
  const [time, setTime] = useState(5000);
  const [isBreak, setIsBreak] = useState(false);
  const [breakCounter, setBreakCounter] = useState(0);


  useEffect(() => {
    if (!isRunning) return;

    setTimeout(() => {
      setTime(time - 1000);
      if (time <= 0) {
        setIsBreak(!isBreak);
        if (!isBreak) {setBreakCounter(breakCounter + 1);}
          if (breakCounter % 3 == 0 && !isBreak && breakCounter != 0) {
            setTime(15000)
          } else if (isBreak) {
            setTime(5000);
          } else {
            setTime(3000);
          }
      }
    }, 1000);
    
    },[time, isRunning]);

    const getFormattedTime = (miliseconds) => {
      let total_seconds = parseInt(Math.floor(miliseconds / 1000));
      let total_minutes = parseInt(Math.floor(total_seconds / 60));

      let seconds = parseInt(total_seconds % 60);
      let minutes = parseInt(total_minutes % 60);

      return `${minutes}:${seconds}`;
    }

  return <div>{getFormattedTime(time)}</div>;
}

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isReset, setIsReset] = useState(false)
  return (
    <div>
      <h1>Domodoro Timer</h1>
      <Timer isRunning={isRunning}/>
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
