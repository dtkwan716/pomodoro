import { useState } from 'react'
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
  const [isNotifOn, setIsNotifOn] = useState(false)
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


  return (
    <main className="app-shell">
      <section className="timer-panel" aria-label="Pomodoro timer">
        <div className="sidebar-section controls-section">
          <div className="sidebar-header">
            <p className="eyebrow">Controls</p>
          </div>

          <div className="session-actions" aria-label="Session controls">
            <button onClick={() => {setIsRunning(true); setIsReset(false);}}> {isReset ? "Start Session" : "Continue Session"} </button>

            <button onClick={() => setIsRunning(false)}> Stop Session </button>

            <button onClick={() => {
              setIsRunning(false);
              setIsReset(true);
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
        </div>
      </section>

      <section className="timer-focus" aria-label="Current time">
        <div className="app-header">
          <h1>Domodoro Timer</h1>
        </div>

        <Timer isRunning={isRunning} isReset={isReset} isFaceDetected={isFaceDetected} notif={{break: breakNotif, work: workNotif}} isNotifOn={isNotifOn}/>
      </section>

      <section className="camera-panel" aria-label="Camera">
        <Camera setIsFaceDetected={setIsFaceDetected} />
      </section>

      <aside className="todo-panel" aria-label="Todo list area">
        <h2>Todo</h2>
        <Todo />
      </aside>

    </main>
  ) 
}

export default App
