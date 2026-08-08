import { GestureRecognizer } from '@mediapipe/tasks-vision';
import { useState, useEffect, useRef } from 'react'
import { UserAuth } from './context/AuthContext';
import { supabase } from '../supabase';



const Timer = ({isRunning, isReset, isFaceDetected, notif, activeSession, onSessionEnd}) => {
  const endTimeRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [duration, setDuration] = useState(1500000);
  const [isBreak, setIsBreak] = useState(false);
  const [breakCounter, setBreakCounter] = useState(0);
  const sessionStartRef = useRef(null);
  const breakStartRef = useRef(null);
  const pauseStartRef = useRef(null);
  const totalBreakRef = useRef(0);
  const totalPauseRef = useRef(0);
  
  const {session} = UserAuth();

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
      const supaInsert = async (data) => { 
        const { error } = await supabase
        .from('public.sessions')
        .insert({
          user_id: session.user.id,
          totalTime: data.totalTime,
          totalBreakTime: data.totalBreakTime,
          totalWorkTime: data.totalWorkTime,
          totalPauseTime: data.totalPauseTime,
          tasksCompleted: data.tasksCompleted,
          completedAt: new Date().toISOString(),
          });
        if(error){
          console.log("failed to save: ", error);
        }
        }
      if(session){
        supaInsert(data);
      }
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

useEffect(() => {
  if (isReset) {
    setRemainingTime(1500000);
    setIsBreak(false);
    setBreakCounter(0);
    endTimeRef.current = null;
    return;
  }

  const facePaused =
    isFaceDetected === 0 &&
    !isBreak &&
    !document.hidden;

  const canRun =
    activeSession &&
    isRunning &&
    !facePaused;

  // Pause the timer
  if (!canRun) {
    if (endTimeRef.current !== null) {
      const pausedRemaining = Math.max(
        0,
        endTimeRef.current - Date.now()
      );

      setRemainingTime(pausedRemaining);
      endTimeRef.current = null;
    }

    return;
  }

  // Start or resume the current period
  if (endTimeRef.current === null) {
    endTimeRef.current = Date.now() + remainingTime;
  }

  const timerId = setTimeout(() => {
    const now = Date.now();

    let localEndTime = endTimeRef.current;
    let localIsBreak = isBreak;
    let localBreakCounter = breakCounter;

    // Catch up through every period that ended while the tab was inactive
    while (now >= localEndTime) {
      let nextDuration;

      if (!localIsBreak) {
        // Work period ended, so begin a break
        localBreakCounter += 1;
        localIsBreak = true;

        const isLongBreak = localBreakCounter % 4 === 0;

        nextDuration = isLongBreak
          ? 1500000
          : 500000;
      } else {
        // Break ended, so begin another work period
        localIsBreak = false;
        nextDuration = 1500000;
      }

      // Continue from the previous scheduled ending time
      localEndTime += nextDuration;
    }

    const newRemainingTime = Math.max(
      0,
      localEndTime - now
    );

    const phaseChanged = localIsBreak !== isBreak;

    endTimeRef.current = localEndTime;
    setRemainingTime(newRemainingTime);
    setIsBreak(localIsBreak);
    setBreakCounter(localBreakCounter);

    if (phaseChanged) {
      if (localIsBreak) {
        notif.break();
      } else {
        notif.work();
      }
    }
  }, 250);

  return () => clearTimeout(timerId);
}, [
  activeSession,
  isRunning,
  isFaceDetected,
  isReset,
  isBreak,
  breakCounter,
  remainingTime,
  notif,
]);

    //Function to format Timer (i.e 01:00 instead of 1:0)
    const getFormattedTime = (miliseconds) => {
      let total_seconds = parseInt(Math.ceil(miliseconds / 1000));
      let total_minutes = parseInt(Math.floor(total_seconds / 60));

      let seconds = parseInt(total_seconds % 60);
      let minutes = parseInt(total_minutes % 60);

      const fseconds = String(seconds).padStart(2, '0');
      const fminutes = String(minutes).padStart(2, '0');
      return `${fminutes}:${fseconds}`;
    }

  return (
  <div className="timer-display">
    {getFormattedTime(remainingTime)}
  </div>
  );
}

export default Timer;
