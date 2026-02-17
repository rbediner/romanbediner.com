// Toggle long-form brief content blocks on Insights cards.
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".expand-brief");

  toggles.forEach((button) => {
    const targetId = button.getAttribute("aria-controls");
    const panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.textContent = isOpen ? "Hide full brief" : "Read full brief";
    });
  });
});
