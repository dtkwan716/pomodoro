import { useState, useEffect, useRef } from 'react'

const Timer = ({isRunning, isReset, isFaceDetected, notif, activeSession, onSessionEnd}) => {
  const [time, setTime] = useState(5000);
  const [isBreak, setIsBreak] = useState(false);
  const [breakCounter, setBreakCounter] = useState(0);
  const sessionStartRef = useRef(null);
  const breakStartRef = useRef(null);
  const pauseStartRef = useRef(null);
  const totalBreakRef = useRef(0);
  const totalPauseRef = useRef(0);

  //Track session data
  useEffect(() => {
    const now = Date.now();

    // Track start of session 
    if (activeSession && sessionStartRef.current == null) {
      sessionStartRef.current = now;
      breakStartRef.current = null;
      pauseStartRef.current = null;
      totalBreakRef.current = 0;
      totalPauseRef.current = 0;
    }

    //Tracks end of session
    if (!activeSession && sessionStartRef.current != null) {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const completedTasks = tasks.filter(task => task.completed);
      // This section is incase you end during a break or pause
      const finalBreak = breakStartRef.current != null
        ? totalBreakRef.current + (now - breakStartRef.current)
        : totalBreakRef.current;
      const finalPause = pauseStartRef.current != null
        ? totalPauseRef.current + (now - pauseStartRef.current)
        : totalPauseRef.current;
      const totalTime = now - sessionStartRef.current;
      const data = {
        totalTime,
        totalBreakTime: finalBreak,
        totalWorkTime: totalTime - finalBreak - finalPause,
        totalPauseTime: finalPause,
        tasksCompleted: completedTasks.length,
      };

      onSessionEnd(data);
      sessionStartRef.current = null;
      breakStartRef.current = null;
      pauseStartRef.current = null;
      totalBreakRef.current = 0;
      totalPauseRef.current = 0;
      console.log("Session Data:", data);
      return;
    }

    if (!activeSession) {
      return;
    }

    if (!isRunning && pauseStartRef.current == null) {
      if (breakStartRef.current != null) {
        totalBreakRef.current += now - breakStartRef.current;
        breakStartRef.current = null;
      }

      pauseStartRef.current = now;
      return;
    }

    if (isRunning && pauseStartRef.current != null) {
      totalPauseRef.current += now - pauseStartRef.current;
      pauseStartRef.current = null;

      if (isBreak) {
        breakStartRef.current = now;
      }
    }

    if (isBreak && isRunning && breakStartRef.current == null) {
      breakStartRef.current = now;
    } else if (!isBreak && breakStartRef.current != null) {
      totalBreakRef.current += now - breakStartRef.current;
      breakStartRef.current = null;
    }
  }, [activeSession, isBreak, isRunning, onSessionEnd])

  //Creates the Timer
  useEffect(() => {
    if (isReset) {
      setTime(5000);
      setIsBreak(false);
      setBreakCounter(0);
      return;
    }
    //Pauses Timer
    if (!isRunning || (isFaceDetected === 0 && !isBreak)) return;

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
    
    },[time, isRunning, isFaceDetected, isReset]);

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

  return (
  <div className="timer-display">
    {getFormattedTime(time)}
  </div>
  );
}

export default Timer;
