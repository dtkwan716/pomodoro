import { useState, useEffect } from 'react'

const Timer = ({isRunning, isReset}) => {
  const [time, setTime] = useState(5000);
  const [isBreak, setIsBreak] = useState(false);
  const [breakCounter, setBreakCounter] = useState(0);

  useEffect(() => {
    if (isReset) {
      setTime(5000);
      setIsBreak(false);
      setBreakCounter(0);
      return;
    }
    if (!isRunning) return;
    setTimeout(() => {
      setTime(prevTime => prevTime - 1000);
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
      return () => clearTimeout();
    }, 1000);
    
    },[time, isRunning]);

    const getFormattedTime = (miliseconds) => {
      let total_seconds = parseInt(Math.floor(miliseconds / 1000));
      let total_minutes = parseInt(Math.floor(total_seconds / 60));

      let seconds = parseInt(total_seconds % 60);
      let minutes = parseInt(total_minutes % 60);

      const fseconds = String(seconds).padStart(2, '0');
      const fminutes = String(minutes).padStart(2, '0');
      return `${fminutes}:${fseconds}`;
    }

  return <div>{getFormattedTime(time)}</div>;
}

export default Timer;