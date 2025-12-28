(function() {
  let seconds = 0;
  let interval = null;

  const timerArea = document.getElementById("timerArea");
  if (!timerArea) return; // Guard clause in case script runs on a page without timer

  const cookMinutes = Number(timerArea.dataset.cook);
  const losingMinute = Number(timerArea.dataset.lose);

  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const losePopup = document.getElementById("losePopup");

  const animationFrame = document.getElementById("animationFrame");

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
    if (animationFrame && animationFrame.contentWindow?.setBurnLevel) {
      animationFrame.contentWindow.setBurnLevel(0);
    }
  }

  function startTimer() {
    if (interval) return; // already running
    // hide lose popup if present when restarting
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
      }

      setButtonStates();
    }, 1000);

    setButtonStates();
  }

  function pauseTimer() {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    setButtonStates();
  }

  function stopTimer() {
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