import { useState, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import Timer from './components/timer'
import Camera from './components/camera'
import Todo from './components/todo'
import Tooltip from '@mui/material/Tooltip';
import './App.css'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isReset, setIsReset] = useState(true)
  const [isFaceDetected, setIsFaceDetected] = useState(false)
  const [isGestureDetected, setIsGestureDetected] = useState(false);
  const [isNotifOn, setIsNotifOn] =  useState(() => {
    const savedNotif = JSON.parse(localStorage.getItem("notifperm"));
    return savedNotif ? savedNotif : false;
  });
  const [activeSession, setActiveSession] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = JSON.parse(localStorage.getItem("theme"));
    return savedTheme ? savedTheme : false;
  });
  const showNotification = (message) => {
    if (!isNotifOn || !('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(message);
  };

  const breakNotif = () => {
    showNotification("Good Job, Time for a break!");
  };

  const workNotif = () => {
    showNotification("Break is over get back to work.");
  };



  const [sessionSummary, setSessionSummary] = useState(null);

  const getFormattedTime = (miliseconds) => {
    let total_seconds = parseInt(Math.floor(miliseconds / 1000));
    let total_minutes = parseInt(Math.floor(total_seconds / 60));
    let total_hours = parseInt(Math.floor(total_minutes / 60));

    let seconds = parseInt(total_seconds % 60);
    let minutes = parseInt(total_minutes % 60);
    let hours = parseInt(total_hours % 24);

    const fseconds = String(seconds).padStart(2, '0');
    const fminutes = String(minutes).padStart(2, '0');
    const fhours = String(hours).padStart(2, '0');
    return `${fhours}:${fminutes}:${fseconds}`;
  }

  useEffect(()=> {
    document.documentElement.classList.toggle('dark', isDark);

    if (isDark) {
      localStorage.setItem("theme", true);
    } else {
      localStorage.setItem("theme", false);
    }
  }, [isDark]);

  useEffect(()=> {
    if (isNotifOn) {
      localStorage.setItem("notifperm", true);
    } else {
      localStorage.setItem("notifperm", false);
    }
  }, [isNotifOn]);

  useEffect(() => {
    if (isGestureDetected === "open"){
      setIsRunning(true);
    } else if (isGestureDetected === "close"){
      setIsRunning(false);
    }
  }, [isGestureDetected]);
  return (
    <main className="app-shell">
      <section className="timer-panel" aria-label="Pomodoro timer">
        <div className="sidebar-section controls-section">
          <div className="sidebar-header">
            <p className="eyebrow">Controls</p>
          </div>

          <div className="session-actions" aria-label="Session controls">
            <button onClick={() => {setIsRunning(true); setIsReset(false); setActiveSession(true);}}> {isReset || !activeSession ? "Start Session" : "Continue Session"} </button>

            <button onClick={() => setIsRunning(false)}> Pause Session </button>

            <button onClick={() => {
              setActiveSession(false);
              setIsRunning(false);
              setActiveSession(false);
            }}>
              End Session
            </button>

            <button onClick={() => {
              setIsRunning(false);
              setIsReset(true);
              setActiveSession(false);

            }}>
              Reset Session
            </button>
          </div>
        </div>

        <div className="sidebar-section settings-section">
          <div className="sidebar-header">
            <p className="eyebrow">Settings</p>
          </div>

          <div className="notification-row">
            <input 
            className="react-switch-checkbox" 
            id={`react-switch-new`}
            type="checkbox"
            checked={isNotifOn}
            onChange={() => {setIsNotifOn(!isNotifOn); Notification.requestPermission();}}
            />
            <label 
              style={{ background: isNotifOn ? '#166534' : '#6b7280' }}
              className="react-switch-label" 
              htmlFor={`react-switch-new`}
            >
              <span className={`react-switch-button`} />
            </label>
            <span>Allow Notifications?</span>
            <Tooltip title="Allow notifications on your website for this to work." arrow> 
              <button className="notification-help-button" type="button">
                ⓘ
              </button>
            </Tooltip>
          </div>

          <div className="notification-row">
            <input 
            className="react-switch-checkbox" 
            id={`react-switch-dark`}
            type="checkbox"
            checked={isDark}
            onChange={() => setIsDark(!isDark)}
            />
            <label 
              style={{ background: !isDark ? '#f6f7f9' : '#111827' }}
              className="react-switch-label" 
              htmlFor={`react-switch-dark`}
            >
              <span className={`react-switch-button`} />
            </label>
            <span>Theme</span>
          </div>
        </div>
      </section>

      <section className="timer-focus" aria-label="Current time">
        <div className="app-header">
          <h1>Domodoro Timer</h1>
        </div>

        <Timer isRunning={isRunning} isReset={isReset} isFaceDetected={isFaceDetected} notif={{break: breakNotif, work: workNotif}} isNotifOn={isNotifOn} activeSession={activeSession} onSessionEnd={setSessionSummary} />

        {sessionSummary && (
          <div className="modal-backdrop">
            <div className="session-modal">
              <h2>Session Summary</h2>
              <p>Session Total: {getFormattedTime(sessionSummary.totalTime)}</p>
              <p>Time Working: {getFormattedTime(sessionSummary.totalWorkTime)}</p>
              <p>Time on Break: {getFormattedTime(sessionSummary.totalBreakTime)}</p>
              <p>Time Paused: {getFormattedTime(sessionSummary.totalPauseTime)}</p>
              <p>Items Completed: {sessionSummary.tasksCompleted}</p>
              <button onClick={() => {
                setSessionSummary(null);
                setIsReset(true);
              }}>
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="camera-panel" aria-label="Camera">
        <Camera setIsFaceDetected={setIsFaceDetected} setIsGestureDetected={setIsGestureDetected}/>
      </section>

      <aside className="todo-panel" aria-label="Todo list area">
        <h2>Todo</h2>
        <Todo />
      </aside>

    </main>
  ) 
}

export default App
