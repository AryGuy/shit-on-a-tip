document.getElementById("clap-btn").addEventListener("click", () => {
  if (current.isSTD) {
    // store score for the gameover page
    sessionStorage.setItem('lastScore', score);
    // redirect to the standalone gameover page
    window.location.href = 'gameover.html';
  } else {
    score += chosenGirls.includes(current.name) ? 2 : 1;
    current = next;
    next = getRandomProfile();
    updateDisplay();
  }
});
