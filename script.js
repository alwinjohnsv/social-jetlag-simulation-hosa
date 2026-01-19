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

// Handle bedtimes that cross midnight (e.g., 01:00 after 23:00)
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
      msg: "Your social jetlag is relatively small. Keeping a consistent schedule will help maintain this.",
    };
  } else if (diff < 2) {
    return {
      level: "Moderate",
      msg: "You have a noticeable shift between weekdays and weekends. Gradual adjustments could reduce fatigue.",
    };
  } else {
    return {
      level: "High",
      msg: "Your social jetlag is large. This level of misalignment is often linked to worse mood and performance.",
    };
  }
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

document.getElementById("calc-current").addEventListener("click", () => {
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
  const sleepStart = [];
  const sleepEnd = [];

  for (let i = 0; i < 5; i++) {
    sleepStart.push(wd.bedH);
    sleepEnd.push(wd.wakeH);
  }
  for (let i = 0; i < 2; i++) {
    sleepStart.push(we.bedH);
    sleepEnd.push(we.wakeH);
  }

  const ctx = document.getElementById("currentChart").getContext("2d");
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Sleep duration (hours)",
          data: sleepEnd.map((end, i) => end - sleepStart[i]),
          backgroundColor: "#38bdf8",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const i = context.dataIndex;
              const start = sleepStart[i] % 24;
              const end = sleepEnd[i] % 24;
              const dur = context.raw.toFixed(1);
              return `Sleep: ${dur}h (from ${start.toFixed(1)}h to ${end.toFixed(1)}h)`;
            },
          },
        },
        legend: {
          labels: { color: "#e5e7eb" },
        },
      },
      scales: {
        x: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
        },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
          title: {
            display: true,
            text: "Hours of sleep",
            color: "#e5e7eb",
          },
        },
      },
    },
  });
});

document.getElementById("calc-fixed").addEventListener("click", () => {
  const wd = normalizeSleepWindow(fixWdBedInput.value, fixWdWakeInput.value);
  const we = normalizeSleepWindow(fixWeBedInput.value, fixWeWakeInput.value);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const sleepStart = [];
  const sleepEnd = [];

  for (let i = 0; i < 5; i++) {
    sleepStart.push(wd.bedH);
    sleepEnd.push(wd.wakeH);
  }
  for (let i = 0; i < 2; i++) {
    sleepStart.push(we.bedH);
    sleepEnd.push(we.wakeH);
  }

  const ctx = document.getElementById("fixedChart").getContext("2d");
  if (fixedChart) fixedChart.destroy();

  fixedChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Sleep duration (hours)",
          data: sleepEnd.map((end, i) => end - sleepStart[i]),
          backgroundColor: "#22c55e",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const i = context.dataIndex;
              const start = sleepStart[i] % 24;
              const end = sleepEnd[i] % 24;
              const dur = context.raw.toFixed(1);
              return `Sleep: ${dur}h (from ${start.toFixed(1)}h to ${end.toFixed(1)}h)`;
            },
          },
        },
        legend: {
          labels: { color: "#e5e7eb" },
        },
      },
      scales: {
        x: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
        },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
          title: {
            display: true,
            text: "Hours of sleep",
            color: "#e5e7eb",
          },
        },
      },
    },
  });
});

// ---------- Tab 2: Circadian Rhythm Sandbox ----------
let sandboxChart;

document.getElementById("run-sim").addEventListener("click", () => {
  const morningLight = Number(document.getElementById("light-morning").value);
  const eveningLight = Number(document.getElementById("light-evening").value);
  const consistency = Number(document.getElementById("consistency").value);
  const caffeineCutoff = Number(document.getElementById("caffeine").value);

  // Simple model: internal clock phase and alertness curve
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const alertness = hours.map((h) => {
    const base = -Math.cos(((h - 16) / 24) * 2 * Math.PI); // peak late afternoon
    const morningBoost = morningLight * 0.05 * Math.exp(-Math.pow(h - 9, 2) / 10);
    const eveningDrag = eveningLight * 0.06 * Math.exp(-Math.pow(h - 22, 2) / 6);
    const consistencyBonus = consistency * 0.03;
    const caffeineEffect =
      h >= 16 && h <= 24 - caffeineCutoff ? 0.15 : 0; // crude: caffeine later in day
    return base + morningBoost - eveningDrag + consistencyBonus + caffeineEffect;
  });

  const misalignment =
    eveningLight * 0.2 - morningLight * 0.15 - consistency * 0.1 + (8 - caffeineCutoff) * 0.05;

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
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" },
        },
      },
      scales: {
        x: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
        },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#1f2937" },
          title: {
            display: true,
            text: "Relative alertness",
            color: "#e5e7eb",
          },
        },
      },
    },
  });

  const explanation = document.getElementById("sim-explanation");
  let text = `Your settings suggest `;
  if (misalignment > 0.8) {
    text +=
      "a delayed internal clock and higher risk of social jetlag—especially if you need early wake times.";
  } else if (misalignment > 0.2) {
    text +=
      "some delay in your internal clock. Earlier light and more consistent bedtimes could improve alignment.";
  } else if (misalignment > -0.2) {
    text +=
      "a fairly neutral alignment. Small tweaks in light and caffeine timing can still fine-tune your rhythm.";
  } else {
    text +=
      "a relatively well-aligned clock, with strong morning cues and consistent sleep supporting stable alertness.";
  }
  explanation.textContent = text;
});

// ---------- Tab 3: Biological Impact Explorer ----------
const bioTitle = document.getElementById("bio-title");
const bioText = document.getElementById("bio-text");

const bioContent = {
  brain: {
    title: "Brain & Cognitive Function",
    text:
      "Social jetlag can impair attention, working memory, and reaction time. When your internal clock is out of sync " +
      "with your schedule, the brain regions that support focus and decision-making may be operating at a biological 'off-peak' time.",
  },
  heart: {
    title: "Cardiovascular System",
    text:
      "Irregular sleep and chronic misalignment are associated in research with higher blood pressure and increased " +
      "cardiometabolic risk. Over time, this may contribute to strain on the heart and blood vessels.",
  },
  metabolism: {
    title: "Metabolism & Glucose Regulation",
    text:
      "Your body’s ability to handle glucose and regulate appetite hormones follows a circadian pattern. " +
      "Social jetlag and sleep debt can disrupt these rhythms, making it harder to maintain stable energy and weight.",
  },
  immune: {
    title: "Immune System",
    text:
      "Sleep supports immune function and repair. When you accumulate sleep debt and shift your schedule back and forth, " +
      "immune signaling can become less efficient, potentially increasing susceptibility to illness.",
  },
  mood: {
    title: "Mood & Emotional Regulation",
    text:
      "Misaligned sleep is linked to higher rates of irritability, low mood, and emotional volatility. " +
      "Your brain’s emotion-regulation circuits rely on consistent, high-quality sleep to reset each night.",
  },
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
  const weeklyDebt = loss * 5; // weekdays
  debtHoursSpan.textContent = weeklyDebt.toFixed(1);

  if (weeklyDebt === 0) {
    debtMessage.textContent =
      "No weekday sleep loss—your schedule is not building measurable sleep debt across the workweek.";
  } else if (weeklyDebt <= 5) {
    debtMessage.textContent =
      "This level of weekly sleep debt can leave you feeling a bit more tired and reliant on catch-up sleep.";
  } else if (weeklyDebt <= 10) {
    debtMessage.textContent =
      "You are accumulating substantial sleep debt. Many people at this level report strong weekend rebound sleep.";
  } else {
    debtMessage.textContent =
      "Very high weekly sleep debt. Over time, this pattern is associated with worse mood, performance, and health.";
  }
}

debtSlider.addEventListener("input", updateDebt);
updateDebt();
