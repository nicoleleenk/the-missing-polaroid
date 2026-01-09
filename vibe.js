const rain = document.getElementById("rainSound");
const thunder = document.getElementById("thunderSound");

document.body.addEventListener("click", () => {
  if (rain.paused) {
    rain.volume = 0.35;
    rain.play();
  }
}, { once: true });

// Occasional thunder
setInterval(() => {
  if (Math.random() < 0.2) {
    thunder.volume = 0.4;
    thunder.play();
  }
}, 25000);

