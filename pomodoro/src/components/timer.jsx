import { useState, useEffect } from 'react'
import Camera from './camera'

const Timer = ({isRunning, isReset, isFaceDetected, notif}) => {
  const [time, setTime] = useState(5000);
  const [isBreak, setIsBreak] = useState(false);
  const [breakCounter, setBreakCounter] = useState(0);


  //Creates the Timer
  useEffect(() => {
    if (isReset) {
      setTime(5000);
      setIsBreak(false);
      setBreakCounter(0);
      return;
    }
    //Pauses Timer
    if (!isRunning || (!isFaceDetected && !isBreak)) return;

    //Timer Logic for Pomodoro
    const timerId = setTimeout(() => {
      setTime(prevTime => prevTime - 1000);
      if (time <= 0) {
        setIsBreak(!isBreak);
        if (!isBreak) {setBreakCounter(breakCounter + 1);}
          if (breakCounter % 3 == 0 && !isBreak && breakCounter != 0) {
            setTime(15000);
            notif.break();
          } else if (isBreak) {
            setTime(5000);
            notif.work();
          } else {
            setTime(3000);
            notif.break();
          }
      }
    }, 1000);
    return () => clearTimeout(timerId);
    
    },[time, isRunning, isFaceDetected]);

    //Function to format Timer (i.e 01:00 instead of 1:0)
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