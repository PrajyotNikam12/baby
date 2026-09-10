
const loader = document.getElementById("loader");
const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const effects = document.getElementById("effects");
const anticipationText = document.getElementById("anticipationText");
const scrollProgress = document.getElementById("scrollProgress");

let rotation = 0;
let spinning = false;
let celebrationLoop = null;
let audioContext = null;

/* ---------- page load ---------- */
window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hidden"), 650);
});

/* ---------- scroll progress ---------- */
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
});

/* ---------- reveal-on-scroll ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));

/* ---------- desktop cursor glow ---------- */
const glow = document.querySelector(".cursor-glow");
if (window.matchMedia("(pointer:fine)").matches) {
  glow.style.display = "block";
  window.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

/* ---------- audio ---------- */
function ensureAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    if (!audioContext) audioContext = new Audio();
    if (audioContext.state === "suspended") audioContext.resume();
    return true;
  } catch {
    return false;
  }
}

function tone(freq, start, duration, type = "sine", volume = 0.06) {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(start);
  osc.stop(start + duration + 0.04);
}

function spinTickSound() {
  if (!ensureAudio()) return;

  const t = audioContext.currentTime;
  tone(120, t, 0.045, "square", 0.018);
}

function celebrationMusic() {
  if (!ensureAudio()) return;

  const t = audioContext.currentTime;

  const melody = [
    523.25, 659.25, 783.99, 1046.50,
    783.99, 1046.50, 1318.51,
    1567.98, 1318.51, 1046.50,
    1318.51, 1567.98, 1760
  ];

  melody.forEach((f, i) => {
    tone(f, t + i * 0.12, 0.42, "sine", 0.075);
  });

  [261.63, 329.63, 392, 523.25].forEach((f, i) => {
    tone(f, t + i * 0.30, 0.7, "triangle", 0.035);
  });

  // soft sparkle notes
  [1046, 1318, 1568].forEach((f, i) => {
    tone(f, t + 1.8 + i * 0.13, 0.32, "sine", 0.045);
  });
}

/* ---------- skyshot sound ---------- */
function skyshotSound() {
  if (!ensureAudio()) return;

  const t = audioContext.currentTime;

  // Rising launch
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(170, t);
  osc.frequency.exponentialRampToValueAtTime(1600, t + 0.72);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.12, t + 0.20);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.82);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(t);
  osc.stop(t + 0.86);

  // Explosion + sparkle burst
  setTimeout(() => {
    if (!audioContext) return;

    const tt = audioContext.currentTime;

    tone(65, tt, 0.28, "sine", 0.16);
    tone(130, tt, 0.20, "square", 0.055);

    [659, 784, 988, 1175, 1397, 1568].forEach((f, i) => {
      tone(f, tt + i * 0.024, 0.30, "triangle", 0.052);
    });
  }, 760);
}

/* ---------- visual fireworks ---------- */
function createFireworks() {
  for (let burst = 0; burst < 8; burst++) {
    setTimeout(() => {
      const cx = 7 + Math.random() * 86;
      const cy = 9 + Math.random() * 48;

      for (let i = 0; i < 40; i++) {
        const p = document.createElement("i");
        p.className = "firework go";

        const angle = Math.PI * 2 * i / 40;
        const distance = 70 + Math.random() * 175;

        p.style.left = cx + "%";
        p.style.top = cy + "%";
        p.style.setProperty("--x", Math.cos(angle) * distance + "px");
        p.style.setProperty("--y", Math.sin(angle) * distance + "px");
        p.style.background = [
          "#72bce7", "#ed86ad", "#ffd66e",
          "#a79df0", "#7ad9bd", "#ffffff"
        ][i % 6];

        effects.appendChild(p);
        setTimeout(() => p.remove(), 2150);
      }

      // star in the middle
      const star = document.createElement("span");
      star.className = "sparkle-pop go";
      star.textContent = "✦";
      star.style.left = cx + "%";
      star.style.top = cy + "%";
      star.style.color = "#fff";
      star.style.setProperty("--x", "0px");
      star.style.setProperty("--y", "-20px");
      effects.appendChild(star);
      setTimeout(() => star.remove(), 1900);
    }, burst * 400);
  }

  for (let i = 0; i < 220; i++) {
    const p = document.createElement("i");
    p.className = "confetti go";

    const angle = Math.random() * Math.PI * 2;
    const distance = 170 + Math.random() * 780;

    p.style.left = (47 + Math.random() * 6) + "%";
    p.style.top = (39 + Math.random() * 12) + "%";
    p.style.setProperty("--x", Math.cos(angle) * distance + "px");
    p.style.setProperty("--y", Math.sin(angle) * distance + "px");
    p.style.setProperty("--r", (Math.random() * 1500 - 750) + "deg");
    p.style.background = [
      "#72bce7", "#ed86ad", "#ffd66e",
      "#a79df0", "#7ad9bd", "#ffffff"
    ][i % 6];

    effects.appendChild(p);
    setTimeout(() => p.remove(), 3300);
  }
}

/* ---------- anticipation ---------- */
function anticipationSequence() {
  const lines = [
    "The secret is waiting…",
    "The little heartbeat is cheering you on…",
    "Almost there… ✨",
    "One magical spin…",
    "Get ready for the biggest surprise!"
  ];

  let i = 0;
  const timer = setInterval(() => {
    if (!spinning) {
      clearInterval(timer);
      return;
    }
    anticipationText.textContent = lines[i % lines.length];
    i++;
  }, 2200);

  return timer;
}

/* ---------- spin ---------- */
spinBtn.addEventListener("click", () => {
  if (spinning) return;

  spinning = true;
  spinBtn.disabled = true;
  ensureAudio();

  status.textContent = "Spinning… the secret is almost here! ✨";
  anticipationSequence();

  // Music begins from the user's click.
  celebrationMusic();

  /*
    IMPORTANT ALIGNMENT:

    The first BOY slice is centered exactly at the top.
    The pointer is exactly at the top.

    Therefore final wheel rotation = 0deg.
    We add 10 complete rotations for a long dramatic spin.
  */

  const current = ((rotation % 360) + 360) % 360;
  const target = 0;
  const adjustment = (target - current + 360) % 360;

  rotation += (360 * 10) + adjustment;

  wheel.style.transform = `rotate(${rotation}deg)`;

  // Subtle tick sounds during the spin.
  let tickCount = 0;
  const tickTimer = setInterval(() => {
    if (!spinning) {
      clearInterval(tickTimer);
      return;
    }
    spinTickSound();
    tickCount++;
    if (tickCount > 24) clearInterval(tickTimer);
  }, 460);

  setTimeout(() => {
    spinning = false;

    skyshotSound();
    createFireworks();

    result.classList.add("show");
    status.innerHTML = "<strong>💙 IT’S A BOY! 💙</strong>";

    result.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    // Continuous celebration.
    celebrationLoop = setInterval(() => {
      skyshotSound();
      createFireworks();
    }, 4200);

  }, 12000);
});
