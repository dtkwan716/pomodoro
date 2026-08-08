import { useState, useEffect, useRef } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import Timer from './components/timer'
import Camera from './components/camera'
import Todo from './components/todo'
import Tooltip from '@mui/material/Tooltip';
import Signup from './components/signup';
import Profile from './components/profile';
import './App.css'
import Modal from 'react-modal';
import { AuthContextProvider, UserAuth } from './components/context/AuthContext';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';

function App() {
  const heroRef = useRef(null);
  const revealPanelRef = useRef(null);
  const revealContentRef = useRef(null);
  const [articleScrollDistance, setArticleScrollDistance] = useState(0);
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

  const [modalIsOpen,setIsOpen] = useState(false);

  const closeModal =() => {
      setIsOpen(false);
  };

  const [accountMode, setAccountMode] = useState("signup");

  const [sidebarMode, setSideBarMode] = useState("default");
  const isProfileOpen = sidebarMode === "profile";

  const [sessionSummary, setSessionSummary] = useState(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // A damped scroll value removes small wheel/trackpad jumps while staying responsive.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.2,
  });

  const leftSidebarX = useTransform(smoothProgress, [0, 0.25], ['0%', '-110%']);
  const rightSidebarX = useTransform(smoothProgress, [0, 0.25], ['0%', '110%']);
  const centerOpacity = useTransform(smoothProgress, [0, 0.22], [1, 0]);
  const centerY = useTransform(smoothProgress, [0, 0.25], ['0px', '72px']);
  const centerScale = useTransform(smoothProgress, [0, 0.22], [1, 0.98]);
  const titleY = useTransform(smoothProgress, [0.15, 0.35], ['0px', '-46px']);
  const scrollHintOpacity = useTransform(smoothProgress, [0.12, 0.3], [0.55, 0]);

  // The clipped edge travels from the divider downward without scaling the content.
  const panelClipPath = useTransform(
    smoothProgress,
    [0.25, 0.6],
    ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
  );
  const panelContentOpacity = useTransform(smoothProgress, [0.45, 0.7], [0, 1]);
  const panelContentY = useTransform(smoothProgress, [0.45, 0.7], ['30px', '0px']);
  useEffect(() => {
    const panel = revealPanelRef.current;
    const content = revealContentRef.current;
    if (!panel || !content) return;

    const updateArticleScrollDistance = () => {
      const initiallyVisibleHeight = Math.min(window.innerHeight * 0.52, 440);
      setArticleScrollDistance(Math.max(0, content.scrollHeight - initiallyVisibleHeight));
    };

    updateArticleScrollDistance();
    const resizeObserver = new ResizeObserver(updateArticleScrollDistance);
    resizeObserver.observe(panel);
    resizeObserver.observe(content);
    window.addEventListener('resize', updateArticleScrollDistance);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateArticleScrollDistance);
    };
  }, []);

  useEffect(() => {
    if (isProfileOpen) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [isProfileOpen]);

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

  const { session } = UserAuth();

  useEffect(() => {
    if(session){
      setAccountMode('signout');
    }
  })

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
    <main className={isProfileOpen ? 'app-page-profile' : ''}>
      <section className="hero-shell" ref={heroRef} aria-label="Pomodoro timer hero">
        <div className="hero-sticky">
          <div className={`app-shell ${sidebarMode === "profile" ? "app-shell-profile" : ""}`}>
            {sidebarMode === "default" && (
              <motion.section
                className="sidebar-default"
                aria-label="Pomodoro timer"
                style={{ x: leftSidebarX }}
              >
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

                <div className="sidebar-section account-section">
                  <div className="sidebar-header">
                    <p className="eyebrow">Account</p>
                  </div>

          <div className="session-actions" aria-label="Account actions">
            <button onClick={() => {setIsOpen(true)}}> {accountMode === 'signout' ? 'Sign Out': 'Sign Up'} </button>
            <Tooltip title="Set up an account or log in to see profile stats." arrow> 
              <button className="notification-help-button" type="button">
                ⓘ
              </button>
            </Tooltip>
            {accountMode === 'signout' && <button onClick={() => {sidebarMode === "default" ? setSideBarMode("profile"): setSideBarMode("default")}}> View Profile</button>}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              className="account-modal"
              overlayClassName="account-modal-overlay"
              ariaHideApp={false}
              contentLabel="Account modal"
            >
                <Signup accountMode={accountMode} setAccountMode={setAccountMode} setIsOpen={setIsOpen}/> 
            </Modal>
          </div>
                </div>
              </motion.section>
            )}

            {sidebarMode === "profile" && (
              <motion.section
                className="sidebar-profile"
                style={{ x: 0 }}
              >
                <div className="sidebar-header">
                    <p className="eyebrow">Profile</p>
                </div>
                <div> 
                  <Profile getFormattedTime={getFormattedTime} />        
                  <button onClick={() => setSideBarMode("default")}> Back </button>
                </div>
              </motion.section>
            )}      


            <section className="timer-focus" aria-label="Current time">
              <motion.div
                className="timer-focus-background"
                aria-hidden="true"
                style={{ opacity: isProfileOpen ? 1 : centerOpacity }}
              />
              <motion.div className="title-area" style={{ y: isProfileOpen ? 0 : titleY }}>
                <div className="app-header">
                  <h1>Domodoro Timer</h1>
                  <motion.p className="scroll-hint" style={{ opacity: isProfileOpen ? 0.55 : scrollHintOpacity }}>
                    Scroll to read more!
                  </motion.p>
                </div>

                <motion.div
                  className="reveal-panel"
                  ref={revealPanelRef}
                  style={{
                    clipPath: isProfileOpen ? 'inset(0 0 100% 0)' : panelClipPath,
                    transformOrigin: 'top center',
                  }}
                >
                  <motion.div
                    className="reveal-panel-content"
                    style={{
                      opacity: isProfileOpen ? 0 : panelContentOpacity,
                      y: isProfileOpen ? 30 : panelContentY,
                    }}
                  >
                    <div
                      className="reveal-panel-scroll"
                      ref={revealContentRef}
                    >
                      <h2>What does Domodoro do?</h2>
                      <p> Domodoro is a productivity tool based on the Pomodoro Technique, which helps you focus on tasks by breaking them into 25-minute intervals followed by 5-minute breaks with a 15-minute long break after four cycles.</p>
                      <h2>Feature overview</h2>
                      <ul>
                        <li>Basic Pomodoro timer with start, stop, and reset functionality</li>
                        <li>Face detection to automatically pause the timer during a working session if the user steps away</li>
                        <p>If you are not using the camera feature,  please disable the camera in the settings. The timer won't work if you just block your camera.</p>
                        <li>Gesture detection to allow for hands-free control of the timer (Closed palm to pause, Open hand to resume)</li>
                        <p>Please note that any camera features do not work when the website is in the background.</p>
                        <li>Session tracking and summary generation</li>
                        <li>View past sessions through the profile section</li>
                        <li>To-do list with task management</li>
                        <p>Make sure to sign in to save your tasks.</p>
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                className="timer-body"
                style={{
                  opacity: isProfileOpen ? 1 : centerOpacity,
                  y: isProfileOpen ? 0 : centerY,
                  scale: isProfileOpen ? 1 : centerScale,
                }}
              >
                <Timer isRunning={isRunning} isReset={isReset} isFaceDetected={isFaceDetected} notif={{break: breakNotif, work: workNotif}} isNotifOn={isNotifOn} activeSession={activeSession} onSessionEnd={setSessionSummary} />
              </motion.div>

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

            <motion.section
              className="camera-panel"
              aria-label="Camera"
              style={{
                opacity: isProfileOpen ? 1 : centerOpacity,
                y: isProfileOpen ? 0 : centerY,
                scale: isProfileOpen ? 1 : centerScale,
              }}
            >
              <Camera setIsFaceDetected={setIsFaceDetected} setIsGestureDetected={setIsGestureDetected}/>
            </motion.section>

            <motion.aside
              className="todo-panel"
              aria-label="Todo list area"
              style={{ x: isProfileOpen ? 0 : rightSidebarX }}
            >
              <h2>Todo</h2>
              <Todo />
            </motion.aside>
        </div>
        </div>
      </section>

      <div
        className="article-scroll-space"
        style={{ height: `${articleScrollDistance}px` }}
        aria-hidden="true"
      />

    </main>
  ) 
}

export default App
