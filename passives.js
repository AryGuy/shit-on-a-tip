function addSpecialButton(label, onClick) {
  const btnContainer = document.querySelector(".buttons"); // reuse your existing button area
  const specialBtn = document.createElement("button");
  specialBtn.id = "special-btn";
  specialBtn.textContent = label;
  specialBtn.style.background = "#8b2"; // give it a distinct look
  specialBtn.style.color = "white";
  specialBtn.style.marginTop = "10px";

  specialBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.playSound(document.getElementById("button-click")); // reuse your click sfx
    onClick();
  });

  btnContainer.appendChild(specialBtn);
}
