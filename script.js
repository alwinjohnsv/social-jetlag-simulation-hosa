// ---------- Tab navigation ----------
const navItems = document.querySelectorAll(".nav-item");
const tabs = document.querySelectorAll(".tab-content");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.getAttribute("data-tab");

    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");

    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.id === target);
    });
  });
});

// ---------- Helpers ----------
function timeToHours(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

function normalizeSleepWindow(bed, wake) {
  let bedH = timeToHours(bed);
  let wakeH = timeToHours(wake);
  if (wakeH <= bedH) wakeH += 24;
  return { bedH, wakeH };
}

function midSleep(bedH, wakeH) {
  return (bedH + wakeH) / 2;
}

function formatRiskMessage(diff) {
  if (diff < 1) {
    return {
      level: "Low",
      msg: "Your social jetlag is minimal. Keeping a consistent schedule will help maintain this."
    };
  } else if (diff < 2) {
    return {
      level: "Moderate",
      msg: "You have a noticeable shift between weekdays and weekends. Gradual adjustments could reduce fatigue."
    };
  } else {
    return {
      level: "High",
      msg: "Your social jetlag is large. This level of misalignment is often linked to worse mood and performance."
    };
  }
}

// ---------- Auto-update helper ----------
function attachAutoUpdate(inputs, callback) {
  inputs.forEach(input => {
    input.addEventListener("input", callback);
    input.addEventListener("change", callback);
  });
}

// ---------- Tab 1: Sleep Schedule Simulator ----------
let currentChart, fixedChart;

const wdBedInput = document.getElementById("wd-bed");
const wdWakeInput = document.getElementById("wd-wake");
const weBedInput = document.getElementById("we-bed");
const weWakeInput = document.getElementById("we-wake");

const fixWdBedInput = document.getElementById("fix-wd-bed");
const fixWdWakeInput = document.getElementById("fix-wd-wake");
const fixWeBedInput = document.getElementById("fix-we-bed");
const fixWeWakeInput = document.getElementById("fix-we-wake");

const sjHoursSpan = document.getElementById("sj-hours");
const riskLevelSpan = document.getElementById("risk-level");
const riskMessageP = document.getElementById("risk-message");

function updateCurrentChart() {
  const wd = normalizeSleepWindow(wdBedInput.value, wdWakeInput.value);
  const we = normalizeSleepWindow(weBedInput.value, weWakeInput.value);

  const midWd = midSleep(wd.bedH, wd.wakeH);
  const midWe = midSleep(we.bedH, we.wakeH);
  const diff = Math.abs(midWe - midWd);

  sjHoursSpan.textContent = diff.toFixed(1);
  const risk = formatRiskMessage(diff);
  riskLevelSpan.textContent = risk.level;
  riskMessageP.textContent = risk.msg;

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const midpoints = [];

  for (let i = 0; i < 5; i++) midpoints.push(midWd);
  for (let i = 0; i < 2; i++) midpoints.push(midWe);

  const ctx = document.getElementById("currentChart").getContext("2d");
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Mid-sleep time (hours)",
          data: midpoints,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.2)",
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { color: "#1f2937" } },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
          title: { display: true, text: "Mid-sleep (hours)", color: "#e5e7eb" }
        }
      }
    }
  });
}

function updateFixedChart() {
  const wd = normalizeSleepWindow(fixWdBedInput.value, fixWdWakeInput.value);
  const we = normalizeSleepWindow(fixWeBedInput.value, fixWeWakeInput.value);

  const midWd = midSleep(wd.bedH, wd.wakeH);
  const midWe = midSleep(we.bedH, we.wakeH);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const midpoints = [];

  for (let i = 0; i < 5; i++) midpoints.push(midWd);
  for (let i = 0; i < 2; i++) midpoints.push(midWe);

  const ctx = document.getElementById("fixedChart").getContext("2d");
  if (fixedChart) fixedChart.destroy();

  fixedChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Mid-sleep time (hours)",
          data: midpoints,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { color: "#1f2937" } },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
          title: { display: true, text: "Mid-sleep (hours)", color: "#e5e7eb" }
        }
      }
    }
  });
}

// Auto-update Tab 1
attachAutoUpdate(
  [wdBedInput, wdWakeInput, weBedInput, weWakeInput],
  updateCurrentChart
);
attachAutoUpdate(
  [fixWdBedInput, fixWdWakeInput, fixWeBedInput, fixWeWakeInput],
  updateFixedChart
);

// Initialize charts
updateCurrentChart();
updateFixedChart();

// ---------- Tab 2: Circadian Rhythm Sandbox ----------
let sandboxChart;

function updateSandbox() {
  const morningLight = Number(document.getElementById("light-morning").value);
  const eveningLight = Number(document.getElementById("light-evening").value);
  const consistency = Number(document.getElementById("consistency").value);
  const caffeineCutoff = Number(document.getElementById("caffeine").value);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const alertness = hours.map((h) => {
    const base = -Math.cos(((h - 16) / 24) * 2 * Math.PI);
    const morningBoost = morningLight * 0.05 * Math.exp(-Math.pow(h - 9, 2) / 10);
    const eveningDrag = eveningLight * 0.06 * Math.exp(-Math.pow(h - 22, 2) / 6);
    const consistencyBonus = consistency * 0.03;
    const caffeineEffect = h >= 16 && h <= 24 - caffeineCutoff ? 0.15 : 0;
    return base + morningBoost - eveningDrag + consistencyBonus + caffeineEffect;
  });

  const ctx = document.getElementById("sandboxChart").getContext("2d");
  if (sandboxChart) sandboxChart.destroy();

  sandboxChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: hours.map((h) => `${h}:00`),
      datasets: [
        {
          label: "Relative alertness",
          data: alertness,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.2)",
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { color: "#1f2937" } },
        y: { ticks: { color: "#e5e7eb" }, grid: { color: "#1f2937" } }
      }
    }
  });

  const misalignment =
    eveningLight * 0.2 - morningLight * 0.15 - consistency * 0.1 + (8 - caffeineCutoff) * 0.05;

  const explanation = document.getElementById("sim-explanation");
  let text = "Your settings suggest ";

  if (misalignment > 0.8) {
    text += "a delayed internal clock and higher risk of social jetlag.";
  } else if (misalignment > 0.2) {
    text += "some delay in your internal clock.";
  } else if (misalignment > -0.2) {
    text += "a fairly neutral alignment.";
  } else {
    text += "a well-aligned circadian rhythm.";
  }

  explanation.textContent = text;
}

// Auto-update Tab 2
attachAutoUpdate(
  [
    document.getElementById("light-morning"),
    document.getElementById("light-evening"),
    document.getElementById("consistency"),
    document.getElementById("caffeine")
  ],
  updateSandbox
);

updateSandbox();

// ---------- Tab 3: Biological Impact Explorer ----------
const bioTitle = document.getElementById("bio-title");
const bioText = document.getElementById("bio-text");

const bioContent = {
  brain: {
    title: "Brain & Cognitive Function",
    text:
      "Social jetlag can impair attention, working memory, and reaction time. Misalignment pushes your brain into off-peak hours."
  },
  heart: {
    title: "Cardiovascular System",
    text:
      "Chronic misalignment is associated with higher blood pressure and increased cardiometabolic strain."
  },
  metabolism: {
    title: "Metabolism & Glucose Regulation",
    text:
      "Circadian disruption affects glucose handling and appetite hormones, making energy regulation harder."
  },
  immune: {
    title: "Immune System",
    text:
      "Sleep supports immune repair. Irregular schedules weaken immune signaling and resilience."
  },
  mood: {
    title: "Mood & Emotional Regulation",
    text:
      "Misaligned sleep increases irritability and emotional volatility due to disrupted neural reset cycles."
  }
};

document.querySelectorAll(".body-part").forEach((part) => {
  part.addEventListener("click", () => {
    const key = part.getAttribute("data-part");
    const content = bioContent[key];
    if (!content) return;
    bioTitle.textContent = content.title;
    bioText.textContent = content.text;
  });
});

// Sleep debt slider
const debtSlider = document.getElementById("debt-loss");
const debtHoursSpan = document.getElementById("debt-hours");
const debtMessage = document.getElementById("debt-message");

function updateDebt() {
  const loss = Number(debtSlider.value);
  const weeklyDebt = loss * 5;
  debtHoursSpan.textContent = weeklyDebt.toFixed(1);

  if (weeklyDebt === 0) {
    debtMessage.textContent =
      "No weekday sleep loss — your schedule is not building measurable sleep debt.";
  } else if (weeklyDebt <= 5) {
    debtMessage.textContent =
      "This level of sleep debt can leave you mildly tired and reliant on weekend recovery.";
  } else if (weeklyDebt <= 10) {
    debtMessage.textContent =
      "You are accumulating substantial sleep debt. Many people at this level show strong rebound sleep.";
  } else {
    debtMessage.textContent =
      "Very high weekly sleep debt. Over time, this pattern is linked to worse mood and performance.";
  }
}

attachAutoUpdate([debtSlider], updateDebt);
updateDebt();
