(function() {
  let seconds = 0;
  let interval = null;

  const timerArea = document.getElementById("timerArea");
  if (!timerArea) return; // Guard clause

  const cookMinutes = Number(timerArea.dataset.cook);
  const losingMinute = Number(timerArea.dataset.lose);
  const recipeId = timerArea.dataset.recipeId;

  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const losePopup = document.getElementById("losePopup");

  const animationFrame = document.getElementById("animationFrame");

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

  function startTimer() {
    if (interval) return; // already running
    if (losePopup) losePopup.style.display = "none";

    interval = setInterval(() => {
      seconds++;
      updateDisplay();

      // 🔥 BURN PROGRESS
      if (animationFrame && animationFrame.contentWindow?.setBurnLevel) {
        const burnProgress = seconds / (losingMinute * 60);
        animationFrame.contentWindow.setBurnLevel(Math.min(burnProgress, 1));
      }

      // 🔥 Lose condition
      const mins = Math.floor(seconds / 60);
      if (mins >= losingMinute) {
        clearInterval(interval);
        interval = null;
        if (losePopup) losePopup.style.display = "block";
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
    setButtonStates();
    if (animationFrame && animationFrame.contentWindow?.stopPanAnimation) {
      animationFrame.contentWindow.stopPanAnimation();
    }
  }

  function stopTimer() {
    if (seconds > 0 && seconds < losingMinute * 60) {
       // Started but stopped before burning -> SUCCESS/COOKED
       recordStat('cooked');
    }

    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    seconds = 0;
    updateDisplay();
    if (losePopup) losePopup.style.display = "none";
    resetAnimation();
    setButtonStates();
  }

  // Attach events
  if (startBtn) startBtn.addEventListener("click", startTimer);
  if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
  if (stopBtn) stopBtn.addEventListener("click", stopTimer);

  // Initial UI state
  updateDisplay();
  setButtonStates();
})();