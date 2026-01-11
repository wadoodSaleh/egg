document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('countdown-container');
    const timerElement = document.getElementById('countdown-timer');
  
    if (!container || !timerElement) return;
  
    const deadlineStr = container.getAttribute('data-deadline');
    if (!deadlineStr) return; // No deadline set
  
    const deadline = parseInt(deadlineStr, 10);
  
    function updateTimer() {
      const now = Date.now();
      const diff = deadline - now;
  
      if (diff <= 0) {
        timerElement.textContent = "00:00:00 - TIME UP";
        // Reload to trigger server redirection to Egg Master page
        // Use a small delay/check to avoid reload loop if server clock is slightly behind client? 
        // No, server redirection logic handles it. However, safeguard against loop if on egg-master page.
        if (window.location.pathname !== '/egg-master') {
            window.location.reload();
        }
        return;
      }
  
      // Format time
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
      const pad = (n) => n.toString().padStart(2, '0');
      timerElement.textContent = ` ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  
    updateTimer(); // Initial call
    setInterval(updateTimer, 1000);
  });
