(function() {
  let seconds = 0;
  let interval = null;

  const timerArea = document.getElementById("timerArea");
  if (!timerArea) return; // Guard clause in case script runs on a page without timer

  const cookMinutes = Number(timerArea.dataset.cook);
  const losingMinute = Number(timerArea.dataset.lose);

  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const losePopup = document.getElementById("losePopup");

  const animationFrame = document.getElementById("animationFrame");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (interval) return;

      interval = setInterval(() => {
        seconds++;

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (timerDisplay) {
          timerDisplay.textContent =
            String(mins).padStart(2, "0") + ":" +
            String(secs).padStart(2, "0");
        }

        // 🔥 BURN PROGRESS
        if (animationFrame && animationFrame.contentWindow?.setBurnLevel) {
          const burnProgress = seconds / (losingMinute * 60);
          animationFrame.contentWindow.setBurnLevel(
            Math.min(burnProgress, 1)
          );
        }
        
        // 🔥 Lose condition
        if (mins >= losingMinute) {
          clearInterval(interval);
          if (losePopup) losePopup.style.display = "block";
        }

      }, 1000);
    });
  }
})();