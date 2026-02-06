const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const interest = (data.get("interest") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    const subject = encodeURIComponent(`Website inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`;
  });
}
