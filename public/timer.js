(function() {
  const SCRIPT_ID = Math.floor(Math.random() * 10000);
  console.log(`[TimerJS] Initialized (ID: ${SCRIPT_ID})`);
  let seconds = 0;
  let interval = null;

  const timerArea = document.getElementById("timerArea");
  if (!timerArea) return; // Guard clause

  const cookMinutes = parseFloat(timerArea.dataset.cook); // Winning time
  const losingMinute = Number(timerArea.dataset.lose);
  const recipeId = timerArea.dataset.recipeId;

  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const losePopup = document.getElementById("losePopup");

  const animationFrame = document.getElementById("animationFrame");
  const alarmSound = new Audio('/Alarm.mp3');

  async function recordStat(outcome) {
    if (!recipeId) return;
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, outcome })
      });
    } catch (err) {
      console.error("Error recording stat:", err);
    }
  }

  function updateDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (timerDisplay) {
      timerDisplay.textContent =
        String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    }
  }

  function setButtonStates() {
    const running = !!interval;
    if (startBtn) startBtn.disabled = running;
    if (pauseBtn) pauseBtn.disabled = !running;
    if (stopBtn) stopBtn.disabled = (!running && seconds === 0);
  }

  function resetAnimation() {
    if (animationFrame && animationFrame.contentWindow) {
      if (animationFrame.contentWindow.setBurnLevel) {
        animationFrame.contentWindow.setBurnLevel(0);
      }
      if (animationFrame.contentWindow.stopPanAnimation) {
        animationFrame.contentWindow.stopPanAnimation();
      }
    }
  }

  function getAnimationProgress(currentSeconds, winMins, loseMins) {
    const winSecs = winMins * 60;
    const loseSecs = loseMins * 60;
    
    // Target: 0.3 is "Happy/Cooked" state in animation (Starts > 0.25)
    // We target 0.3 so it turns happy shortly before the winning time, rather than too early.
    const HAPPY_LEVEL = 0.3; 

    if (currentSeconds <= winSecs) {
      // Scale from 0 to 0.4 based on time to winning minute
      return (currentSeconds / winSecs) * HAPPY_LEVEL;
    } else {
      // Scale from 0.4 to 1.0 based on time from winning to losing
      const progress = (currentSeconds - winSecs) / (loseSecs - winSecs);
      return HAPPY_LEVEL + (progress * (1 - HAPPY_LEVEL));
    }
  }

  function startTimer() {
    console.log("startTimer called");
    if (interval) return; // already running
    if (losePopup) losePopup.style.display = "none";

    // unlock audio context
    try {
        if (alarmSound) {
            const playPromise = alarmSound.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                }).catch(e => console.log("Audio unlock failed (promise reject):", e));
            }
        }
    } catch (e) {
        console.error("Audio unlock failed (sync error):", e);
    }

    interval = setInterval(() => {
      seconds++;
      updateDisplay();

      // 🔔 Play Alarm at Winning Time
      // Use Math.abs < 0.1 to be safe with float comparison if seconds were not int, but seconds is int here.
      if (Math.abs(seconds - (cookMinutes * 60)) < 0.5) { 
        console.log("Win time reached! Playing alarm...");
        try {
            if (alarmSound) {
                alarmSound.currentTime = 0;
                alarmSound.play().catch(e => console.log("Audio play blocked", e));
            }
        } catch (e) {
            console.error("Error playing alarm:", e);
        }
      }

      // 🔥 BURN PROGRESS (Aligned with Winning Time)
      if (animationFrame && animationFrame.contentWindow?.setBurnLevel) {
        const progress = getAnimationProgress(seconds, cookMinutes, losingMinute);
        animationFrame.contentWindow.setBurnLevel(Math.min(progress, 1));
      }

      // 🔥 Lose condition
      const currentMinutes = seconds / 60; // Allow partial minute comparison if needed, but usually lose is int
      // Actually losingMinute is int, but let's be safe
      if (seconds >= losingMinute * 60) {
        clearInterval(interval);
        interval = null;
        if (losePopup) losePopup.style.display = "flex";
        
        // Stop alarm if still playing
        alarmSound.pause();
        alarmSound.currentTime = 0;

        setButtonStates();
        recordStat('burned'); // Record BURNT egg
      }

      setButtonStates();
    }, 1000);

    setButtonStates();
    if (animationFrame && animationFrame.contentWindow) {
      if (animationFrame.contentWindow.setPanAnimationSpeed) {
        animationFrame.contentWindow.setPanAnimationSpeed(300);
      }
      if (animationFrame.contentWindow.startPanAnimation) {
        animationFrame.contentWindow.startPanAnimation();
      }
    }
  }

  function pauseTimer() {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    
    // Stop alarm on pause
    alarmSound.pause();
    alarmSound.currentTime = 0;

    setButtonStates();
    if (animationFrame && animationFrame.contentWindow?.stopPanAnimation) {
      animationFrame.contentWindow.stopPanAnimation();
    }
  }

  function stopTimer() {
    // Condition: Stopped AFTER winning time but BEFORE losing time
    if (seconds >= cookMinutes * 60 && seconds < losingMinute * 60) {
       // SUCCESS/COOKED
       recordStat('cooked');
    }
    // Else: Too early (undercooked) or already handled by auto-stop (burned)

    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    seconds = 0;
    
    // Stop alarm on stop
    alarmSound.pause();
    alarmSound.currentTime = 0;

    updateDisplay();
    if (losePopup) losePopup.style.display = "none";
    resetAnimation();
    setButtonStates();
  }

  // Attach events
  // Attach events (Use .onclick to prevent duplicate listeners if script runs twice)
  if (startBtn) startBtn.onclick = startTimer;
  if (pauseBtn) pauseBtn.onclick = pauseTimer;
  if (stopBtn) stopBtn.onclick = stopTimer;

  // Initial UI state
  updateDisplay();
  setButtonStates();
})();