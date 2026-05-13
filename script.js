(function () {
  "use strict";

  const STORAGE = {
    habits: "dustbound_habits",
    energy: "dustbound_energy",
    history: "dustbound_history",
    nap: "dustbound_nap",
    lastOpen: "dustbound_last_open",
    morningDone: "dustbound_morning_done",
    daily: "dustbound_daily",
    fog: "dustbound_fog_mode",
    sensory: "dustbound_sensory_flare",
  };

  const AUTH_STORAGE = {
    users: "dustbound_accounts_v1",
    session: "dustbound_session_v1",
  };

  const EMOJI_LEVELS = [
    { level: 1, emoji: "🪫", label: "Empty — we’ll keep the room soft and dim." },
    { level: 2, emoji: "🌧️", label: "Heavy — slow steps, lots of permission." },
    { level: 3, emoji: "🌿", label: "Steady — a normal gentle day." },
    { level: 4, emoji: "🌤️", label: "Bright — a little more sparkle." },
    { level: 5, emoji: "✨", label: "Sparkling — big gentle joy." },
  ];

  /** Templates grouped by task type + category. */
  const TASK_TEMPLATES = [
    { id: "habit-meds", kind: "habit", category: "Health", name: "Take medications", spoons: 2, level1: "Take all scheduled meds and log symptoms.", level2: "Take critical meds and set reminder for the rest.", level3: "Take one essential medication with water." },
    { id: "habit-water", kind: "habit", category: "Health", name: "Hydration check", spoons: 1, level1: "Finish full water goal for the day.", level2: "Drink two glasses of water.", level3: "Drink one glass of water now." },
    { id: "habit-stretch", kind: "habit", category: "Movement", name: "Gentle stretch", spoons: 2, level1: "Do a full 15-minute mobility routine.", level2: "Do 5 minutes of neck/back stretching.", level3: "One seated stretch with deep breaths." },
    { id: "habit-walk", kind: "habit", category: "Movement", name: "Short walk", spoons: 4, level1: "Take a 30-minute outdoor walk.", level2: "Take a 10-minute walk.", level3: "Step outside for 2 minutes and return." },
    { id: "habit-journal", kind: "habit", category: "Mind", name: "Journal check-in", spoons: 2, level1: "Write a full page including feelings and wins.", level2: "Write three short lines.", level3: "Write one word for today." },
    { id: "habit-breathing", kind: "habit", category: "Mind", name: "Breathing reset", spoons: 1, level1: "10-minute guided breathing session.", level2: "3 minutes paced breathing.", level3: "5 deep breaths with eyes closed." },
    { id: "habit-reading", kind: "habit", category: "Learning", name: "Read or learn", spoons: 3, level1: "Read/study for 30 minutes and take notes.", level2: "Read for 10 minutes.", level3: "Read one paragraph or one note." },
    { id: "habit-budget", kind: "habit", category: "Admin", name: "Money check-in", spoons: 4, level1: "Review balances, bills, and categorize spending.", level2: "Review account balances only.", level3: "Open banking app and check one account." },
    { id: "habit-planning", kind: "habit", category: "Admin", name: "Plan tomorrow", spoons: 2, level1: "Plan top 5 tasks with time blocks.", level2: "List top 3 priorities.", level3: "Write one must-do for tomorrow." },
    { id: "habit-skin", kind: "habit", category: "Self-care", name: "Skin care", spoons: 2, level1: "Full routine morning or evening.", level2: "Cleanse + moisturizer.", level3: "Rinse face and moisturize." },
    { id: "habit-hair", kind: "habit", category: "Self-care", name: "Hair reset", spoons: 3, level1: "Wash, dry, and basic style.", level2: "Wash or refresh only.", level3: "Brush hair and tie back." },
    { id: "habit-connection", kind: "habit", category: "Social", name: "Connection message", spoons: 2, level1: "Send thoughtful message to two people.", level2: "Reply to one pending message.", level3: "Send one heart or quick check-in." },

    { id: "chore-kitchen-dishes", kind: "chore", category: "Kitchen", name: "Dishes", spoons: 5, level1: "Wash, dry, put away all dishes and wipe sink.", level2: "Load dishwasher and hand-wash essentials.", level3: "Rinse and soak the biggest items." },
    { id: "chore-kitchen-counters", kind: "chore", category: "Kitchen", name: "Wipe counters", spoons: 2, level1: "Clear and sanitize all counters and table.", level2: "Wipe high-use prep area.", level3: "Wipe one spot by sink/stove." },
    { id: "chore-kitchen-fridge", kind: "chore", category: "Kitchen", name: "Fridge cleanup", spoons: 4, level1: "Discard old food and wipe all shelves.", level2: "Clear one shelf and toss expired items.", level3: "Throw away one expired item." },
    { id: "chore-bathroom-sink", kind: "chore", category: "Bathroom", name: "Bathroom sink + mirror", spoons: 3, level1: "Clean sink, counter, mirror, and fixtures.", level2: "Wipe sink and mirror.", level3: "Rinse sink and quick mirror swipe." },
    { id: "chore-bathroom-toilet", kind: "chore", category: "Bathroom", name: "Toilet clean", spoons: 4, level1: "Deep clean inside/outside toilet and floor.", level2: "Bowl + seat wipe.", level3: "Quick seat + handle disinfect." },
    { id: "chore-bedroom-laundry", kind: "chore", category: "Bedroom", name: "Laundry reset", spoons: 6, level1: "Wash, dry, fold, and put away full load.", level2: "Wash and dry one load.", level3: "Start one load only." },
    { id: "chore-bedroom-bed", kind: "chore", category: "Bedroom", name: "Bed refresh", spoons: 2, level1: "Change sheets and make bed fully.", level2: "Make the bed neatly.", level3: "Pull blanket up and fluff pillows." },
    { id: "chore-living-vacuum", kind: "chore", category: "Living room", name: "Vacuum common area", spoons: 5, level1: "Vacuum full living/dining area.", level2: "Vacuum high-traffic zone.", level3: "Spot vacuum one section." },
    { id: "chore-living-clutter", kind: "chore", category: "Living room", name: "Declutter surfaces", spoons: 3, level1: "Reset all visible surfaces and shelves.", level2: "Reset coffee table + one shelf.", level3: "Put away five items." },
    { id: "chore-office-desk", kind: "chore", category: "Office", name: "Desk reset", spoons: 3, level1: "Clear desk, file papers, sanitize devices.", level2: "Clear desk and trash.", level3: "Put away three desk items." },
    { id: "chore-office-inbox", kind: "chore", category: "Office", name: "Email triage", spoons: 4, level1: "Clear inbox to near-zero.", level2: "Process 15 emails.", level3: "Archive/delete 5 emails." },
    { id: "chore-entry-trash", kind: "chore", category: "Entryway", name: "Trash + recycling", spoons: 2, level1: "Collect and take out all trash/recycling.", level2: "Take out one full bin.", level3: "Bag one small trash pile." },
    { id: "chore-entry-shoes", kind: "chore", category: "Entryway", name: "Shoes and bags reset", spoons: 2, level1: "Organize all shoes, coats, and bags.", level2: "Line up shoes and hang coats.", level3: "Put away one pair of shoes." },
    { id: "chore-wholehouse-dust", kind: "chore", category: "Whole home", name: "Dusting round", spoons: 5, level1: "Dust all major surfaces in home.", level2: "Dust one room thoroughly.", level3: "Dust one shelf." },
    { id: "chore-wholehouse-floor", kind: "chore", category: "Whole home", name: "Floor reset", spoons: 6, level1: "Sweep/mop all hard floors.", level2: "Sweep/mop one room.", level3: "Sweep one visible area." },
  ];

  const state = {
    habits: [],
    energyLevel: 3,
    history: [],
    isNapMode: false,
    lastOpenDate: "",
    morningDoneDate: "",
    daily: {},
    selectedHabitId: null,
    tempMorningEnergy: 3,
    prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    fogMode: false,
    sensoryFlare: false,
    currentUserEmail: "",
    currentUserProfile: null,
  };

  function getTodayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
  }

  function getAccounts() {
    return loadJSON(AUTH_STORAGE.users, {});
  }

  function saveAccounts(accounts) {
    saveJSON(AUTH_STORAGE.users, accounts);
  }

  function getCurrentUserScope() {
    return state.currentUserEmail || "guest";
  }

  function scopedStorageKey(key) {
    if (Object.values(STORAGE).includes(key)) return `${key}__${getCurrentUserScope()}`;
    return key;
  }

  function getScopedItem(key) {
    return localStorage.getItem(scopedStorageKey(key));
  }

  function setScopedItem(key, value) {
    localStorage.setItem(scopedStorageKey(key), value);
  }

  function getIntensityFromSpoons(spoons) {
    const n = Math.max(1, Math.min(12, Number(spoons) || 3));
    if (n <= 2) return "low";
    if (n <= 5) return "medium";
    return "high";
  }

  function getIntensityLabel(intensity) {
    if (intensity === "low") return "Low energy";
    if (intensity === "high") return "High energy";
    return "Medium energy";
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(scopedStorageKey(key));
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(scopedStorageKey(key), JSON.stringify(value));
  }

  function showToast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("toast-show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("toast-show"), 4200);
  }

  function migrateHabits() {
    let changed = false;
    state.habits = state.habits.map((h) => {
      const next = { ...h };
      if (!next.spoons || Number(next.spoons) < 1) {
        changed = true;
        next.spoons = next.intensity === "high" ? 7 : next.intensity === "low" ? 2 : 4;
      }
      if (!next.intensity || !["high", "medium", "low"].includes(next.intensity)) {
        changed = true;
        next.intensity = getIntensityFromSpoons(next.spoons);
      }
      if (!next.kind) {
        changed = true;
        next.kind = "habit";
      }
      if (!next.category) {
        changed = true;
        next.category = "General";
      }
      return next;
    });
    if (changed) saveJSON(STORAGE.habits, state.habits);
  }

  function applyLightingAndMood(clamped) {
    const body = document.body;
    for (let i = 1; i <= 5; i += 1) {
      body.classList.remove(`energy-light-${i}`, `sprite-mood-${i}`);
    }
    body.classList.add(`energy-light-${clamped}`, `sprite-mood-${clamped}`);
  }

  function updateCheckinSprite(level) {
    const wrap = document.getElementById("checkin-character");
    if (!wrap) return;
    const n = typeof level === "number" && level >= 1 && level <= 5 ? level : 3;
    wrap.setAttribute("data-mood", String(n));
  }

  function initApp() {
    if (initApp._initialized) return;
    initApp._initialized = true;

    state.habits = loadJSON(STORAGE.habits, []);
    state.energyLevel = loadJSON(STORAGE.energy, 3);
    if (typeof state.energyLevel !== "number" || state.energyLevel < 1 || state.energyLevel > 5) {
      state.energyLevel = 3;
    }
    state.history = loadJSON(STORAGE.history, []);
    state.isNapMode = loadJSON(STORAGE.nap, false);
    state.lastOpenDate = getScopedItem(STORAGE.lastOpen) || "";
    state.morningDoneDate = getScopedItem(STORAGE.morningDone) || "";
    state.daily = loadJSON(STORAGE.daily, {});

    migrateHabits();

    state.fogMode = loadJSON(STORAGE.fog, false);
    state.sensoryFlare = loadJSON(STORAGE.sensory, false);
    document.body.classList.toggle("sensory-flare", !!state.sensoryFlare);
    document.body.classList.toggle("sensory-flare-mode", !!state.sensoryFlare);

    const today = getTodayStr();
    if (state.lastOpenDate !== today) {
      state.lastOpenDate = today;
      setScopedItem(STORAGE.lastOpen, today);
      if (state.morningDoneDate !== today) {
        queueMicrotask(() => openMorningModal());
      }
    }

    syncDailyRecord(today);
    updateEnergyState(state.energyLevel);
    applyNapMode();
    bindNav();
    bindMorningModal();
    initChoreTemplateSelect();
    bindAddHabitScreen();
    bindRadial();
    bindNapToggle();
    bindNestFeatures();
    const morningCheckinBtn = document.getElementById("btn-morning-checkin");
    if (morningCheckinBtn) morningCheckinBtn.addEventListener("click", openMorningModal);

    state.prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      state.prefersDark = e.matches;
      updateEnergyState(state.energyLevel);
    });
    window.addEventListener("resize", () => {
      clearTimeout(initApp._resizeTimer);
      initApp._resizeTimer = setTimeout(() => {
        renderNestMotes();
      }, 120);
    });

    renderHabitList();
    renderNestMotes();
    renderJar();
    renderSkyMap();
    syncSensoryToggle();
    syncFogButton();
    syncNapButtons();
    updateSpoonForecast();
  }

  function syncDailyRecord(today) {
    if (!state.daily[today]) {
      state.daily[today] = {
        energy: state.energyLevel,
        nap: state.isNapMode,
      };
    } else {
      state.daily[today].nap = state.isNapMode;
      if (!state.daily[today].energy) state.daily[today].energy = state.energyLevel;
    }
    saveJSON(STORAGE.daily, state.daily);
  }

  function updateEnergyState(level) {
    const clamped = Math.min(5, Math.max(1, Math.round(Number(level)) || 3));
    state.energyLevel = clamped;
    saveJSON(STORAGE.energy, clamped);

    const body = document.body;
    body.classList.remove(
      "theme-deep",
      "theme-warm",
      "theme-flare",
      "low-stimulation",
      "active-mode",
      "flare-mode",
      "energy-low",
      "highlight-minimal",
    );

    const useDeep = state.prefersDark || clamped <= 2;

    if (clamped <= 2) {
      body.classList.add("theme-deep", "low-stimulation", "energy-low", "active-mode");
    } else if (clamped === 3) {
      body.classList.add(useDeep ? "theme-deep" : "theme-warm", "active-mode");
    } else {
      body.classList.add(useDeep ? "theme-deep" : "theme-flare", "flare-mode");
    }

    if (clamped < 3) body.classList.add("highlight-minimal");

    applyLightingAndMood(clamped);

    const baseBreath = 4.5;
    const baseFloat = 6;
    let breath = clamped <= 2 ? baseBreath * 1.5 : clamped >= 4 ? baseBreath * 0.85 : baseBreath;
    let flt = clamped <= 2 ? baseFloat * 1.2 : clamped >= 4 ? baseFloat * 0.9 : baseFloat;
    let drift = clamped <= 2 ? 18 : clamped >= 4 ? 11 : 14;
    const sensoryMult = state.sensoryFlare ? 2.5 : 1;
    breath *= sensoryMult;
    flt *= sensoryMult;
    drift *= sensoryMult;

    document.documentElement.style.setProperty("--breath-duration", `${breath}s`);
    document.documentElement.style.setProperty("--float-duration", `${flt}s`);
    document.documentElement.style.setProperty("--mote-drift-duration", `${drift}s`);

    const today = getTodayStr();
    if (state.daily[today]) {
      state.daily[today].energy = clamped;
      saveJSON(STORAGE.daily, state.daily);
    }
  }

  function getTodayCompletedHabitIds() {
    const today = getTodayStr();
    const set = new Set();
    state.history.forEach((entry) => {
      if (entry.date === today && entry.habitId) set.add(entry.habitId);
    });
    return set;
  }

  function renderNestMotes() {
    const layer = document.getElementById("motes-layer");
    layer.innerHTML = "";

    const fogActive = state.fogMode && !state.isNapMode;
    document.body.classList.toggle("fog-mode", fogActive);
    syncFogButton();
    updateFogSpeechVisibility();

    if (state.isNapMode) {
      return;
    }

    const completed = getTodayCompletedHabitIds();
    const canvas = document.querySelector(".nest-canvas");
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height * 0.42;
    const spriteR = Math.min(rect.width, rect.height) * 0.22;
    const ORB_SIZE = 60;
    const ORB_RADIUS = ORB_SIZE / 2;
    const EDGE_PADDING = 16;
    const minX = EDGE_PADDING + ORB_RADIUS;
    const maxX = rect.width - EDGE_PADDING - ORB_RADIUS;
    const minY = Math.max(EDGE_PADDING + ORB_RADIUS, rect.height * 0.16);
    const maxY = rect.height * 0.74 - ORB_RADIUS;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const ringMin = spriteR + 58;
    const ringMax = Math.max(ringMin + 10, Math.min(rect.width, rect.height) * 0.45);

    const incomplete = state.habits.filter((h) => !completed.has(h.id));

    if (state.fogMode) {
      if (!incomplete.length) {
        showToast("No open chores — add one in the Lab, or turn off fog mode.");
        state.fogMode = false;
        saveJSON(STORAGE.fog, false);
        document.body.classList.remove("fog-mode");
        syncFogButton();
        updateFogSpeechVisibility();
        renderNestMotes();
        return;
      }
      const focusHabit = incomplete[0];
      incomplete.forEach((habit, index) => {
        const isFocus = habit.id === focusHabit.id;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = isFocus ? "mote mote-fog-focus" : "mote mote-fog-dim";
        btn.dataset.habitId = habit.id;
        btn.style.animationDelay = `${(index % 5) * 0.35}s`;
        if (isFocus) {
          btn.innerHTML = `<span class="mote-fog-title">${escapeHtml(habit.name)} — minimal step</span><span class="mote-fog-l3">${escapeHtml(habit.level3 || "Smallest honest step.")}</span>`;
          btn.addEventListener("click", () => completeTask(habit.id, 3));
        } else {
          btn.textContent = "";
          btn.dataset.label = habit.name;
          btn.setAttribute("aria-label", habit.name);
          let placed = false;
          let attempts = 0;
          while (!placed && attempts < 60) {
            attempts += 1;
            const angle = Math.random() * Math.PI * 2;
            const radius = ringMin + Math.random() * Math.max(1, ringMax - ringMin);
            const px = clamp(cx + Math.cos(angle) * radius, minX, maxX);
            const py = clamp(cy + Math.sin(angle) * radius, minY, maxY);
            const dist = Math.hypot(px - cx, py - cy);
            if (dist > spriteR + 44) {
              btn.style.left = `${px - ORB_RADIUS}px`;
              btn.style.top = `${py - ORB_RADIUS}px`;
              placed = true;
            }
          }
          if (!placed) {
            const fallbackAngle = ((index % 8) / 8) * Math.PI * 2;
            const fallbackRadius = Math.min(ringMax, ringMin + 26);
            const px = clamp(cx + Math.cos(fallbackAngle) * fallbackRadius, minX, maxX);
            const py = clamp(cy + Math.sin(fallbackAngle) * fallbackRadius, minY, maxY);
            btn.style.left = `${px - ORB_RADIUS}px`;
            btn.style.top = `${py - ORB_RADIUS}px`;
          }
        }
        layer.appendChild(btn);
      });
      return;
    }

    state.habits.forEach((habit, index) => {
      if (completed.has(habit.id)) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mote";
      btn.textContent = "";
      btn.dataset.label = habit.name;
      btn.setAttribute("aria-label", habit.name);
      btn.dataset.habitId = habit.id;
      btn.style.animationDelay = `${(index % 5) * 0.7}s`;

      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 80) {
        attempts += 1;
        const angle = Math.random() * Math.PI * 2;
        const radius = ringMin + Math.random() * Math.max(1, ringMax - ringMin);
        const px = clamp(cx + Math.cos(angle) * radius, minX, maxX);
        const py = clamp(cy + Math.sin(angle) * radius, minY, maxY);
        const dist = Math.hypot(px - cx, py - cy);
        if (dist > spriteR + 46) {
          btn.style.left = `${px - ORB_RADIUS}px`;
          btn.style.top = `${py - ORB_RADIUS}px`;
          placed = true;
        }
      }
      if (!placed) {
        const fallbackAngle = ((index % 10) / 10) * Math.PI * 2;
        const fallbackRadius = Math.min(ringMax, ringMin + 30);
        const px = clamp(cx + Math.cos(fallbackAngle) * fallbackRadius, minX, maxX);
        const py = clamp(cy + Math.sin(fallbackAngle) * fallbackRadius, minY, maxY);
        btn.style.left = `${px - ORB_RADIUS}px`;
        btn.style.top = `${py - ORB_RADIUS}px`;
      }

      btn.addEventListener("click", () => openRadial(habit));
      layer.appendChild(btn);
    });
  }

  function openRadial(habit) {
    state.selectedHabitId = habit.id;
    const menu = document.getElementById("radial-menu");
    const backdrop = document.getElementById("radial-backdrop");
    document.getElementById("radial-habit-name").textContent = habit.name;
    menu.hidden = false;
    backdrop.hidden = false;
  }

  function closeRadial() {
    state.selectedHabitId = null;
    document.getElementById("radial-menu").hidden = true;
    document.getElementById("radial-backdrop").hidden = true;
  }

  function bindRadial() {
    document.getElementById("radial-backdrop").addEventListener("click", closeRadial);
    document.getElementById("radial-close").addEventListener("click", closeRadial);
    document.querySelectorAll(".radial-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        const level = Number(btn.dataset.level);
        const habitId = state.selectedHabitId;
        closeRadial();
        if (habitId) completeTask(habitId, level);
      });
    });
  }

  function completeTask(habitId, level) {
    const btn = document.querySelector(`.mote[data-habit-id="${habitId}"]`);
    const today = getTodayStr();
    const entry = {
      date: today,
      habitId,
      level,
      energy: state.energyLevel,
      nap: state.isNapMode,
      ts: Date.now(),
    };
    state.history.push(entry);
    saveJSON(STORAGE.history, state.history);

    updateSpoonForecast();
    renderHabitList();

    const jarEl = document.getElementById("jar-stack-wrap");
    const frame = document.getElementById("app-frame");

    if (btn && jarEl && frame) {
      btn.classList.add("fade-out");
      const start = btn.getBoundingClientRect();
      const end = jarEl.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();

      spawnParticle(
        {
          x: start.left + start.width / 2 - fr.left,
          y: start.top + start.height / 2 - fr.top,
        },
        {
          x: end.left + end.width / 2 - fr.left,
          y: end.top + end.height / 2 - fr.top,
        },
        level,
        state.energyLevel <= 2 && level === 3,
        () => {
          renderJar();
          renderSkyMap();
        },
      );
      setTimeout(() => {
        btn.remove();
        renderNestMotes();
      }, 520);
    } else {
      renderNestMotes();
      renderJar();
      renderSkyMap();
    }
  }

  function spawnParticle(from, to, level, goldLow, onDone) {
    const layer = document.getElementById("particle-layer");
    const dot = document.createElement("div");
    dot.className = "particle";
    dot.style.left = `${from.x}px`;
    dot.style.top = `${from.y}px`;

    const colors = {
      1: "var(--color-mote-lvl1)",
      2: "var(--color-mote-lvl2)",
      3: "var(--color-mote-lvl3)",
    };
    dot.style.background = goldLow
      ? "radial-gradient(circle at 30% 30%, var(--gold-300), var(--gold-500))"
      : colors[level] || colors[2];
    if (goldLow) dot.style.boxShadow = "0 0 18px rgba(212, 165, 90, 0.95), 0 0 28px rgba(245, 200, 120, 0.45)";

    layer.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style.transition =
        "left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s ease-in-out, opacity 0.9s ease-in-out";
      dot.style.left = `${to.x}px`;
      dot.style.top = `${to.y}px`;
      dot.style.transform = "scale(0.45)";
      dot.style.opacity = "0.85";
    });

    setTimeout(() => {
      dot.remove();
      if (typeof onDone === "function") onDone();
    }, 950);
  }

  function toggleNapMode(force) {
    const next = typeof force === "boolean" ? force : !state.isNapMode;
    if (next && state.fogMode) {
      state.fogMode = false;
      saveJSON(STORAGE.fog, false);
    }
    state.isNapMode = next;
    saveJSON(STORAGE.nap, next);

    const toggle = document.getElementById("nap-toggle");
    if (toggle) toggle.setAttribute("aria-checked", next ? "true" : "false");

    const today = getTodayStr();
    syncDailyRecord(today);
    if (state.daily[today]) {
      state.daily[today].nap = next;
      saveJSON(STORAGE.daily, state.daily);
    }

    applyNapMode();
    syncNapButtons();
    renderNestMotes();
    renderSkyMap();
  }

  function applyNapMode() {
    const body = document.body;
    const napSpeech = document.getElementById("sprite-speech-nap");
    const fogSpeech = document.getElementById("sprite-speech-fog");
    if (state.isNapMode) {
      if (state.fogMode) {
        state.fogMode = false;
        saveJSON(STORAGE.fog, false);
      }
      body.classList.add("nap-mode-active");
      body.classList.remove("fog-mode");
      if (napSpeech) napSpeech.hidden = false;
      if (fogSpeech) fogSpeech.hidden = true;
    } else {
      body.classList.remove("nap-mode-active");
      if (napSpeech) napSpeech.hidden = true;
      updateFogSpeechVisibility();
    }
  }

  function updateFogSpeechVisibility() {
    const fogSpeech = document.getElementById("sprite-speech-fog");
    if (!fogSpeech) return;
    if (state.fogMode && !state.isNapMode) {
      fogSpeech.hidden = false;
    } else {
      fogSpeech.hidden = true;
    }
  }

  function syncFogButton() {
    const btn = document.getElementById("btn-fog-toggle");
    if (btn) btn.setAttribute("aria-pressed", state.fogMode ? "true" : "false");
  }

  function syncSensoryToggle() {
    const t = document.getElementById("sensory-flare-toggle");
    if (t) t.setAttribute("aria-checked", state.sensoryFlare ? "true" : "false");
  }

  function countLevel1Today() {
    const t = getTodayStr();
    return state.history.filter((h) => h.date === t && h.level === 1).length;
  }

  function updateSpoonForecast() {
    const n = countLevel1Today();
    document.body.classList.toggle("spoon-warning", n > 2);
    if (n > 2) {
      const k = `dustbound_spoon_toast_${getTodayStr()}`;
      if (!localStorage.getItem(k)) {
        showToast("You're working so hard! Let's save some dust for tomorrow's Sprite.");
        localStorage.setItem(k, "1");
      }
    }
  }

  function bindNestFeatures() {
    const fogBtn = document.getElementById("btn-fog-toggle");
    if (fogBtn) {
      fogBtn.addEventListener("click", () => {
        if (state.isNapMode) {
          showToast("Turn off Sprite Nap to use fog mode.");
          return;
        }
        state.fogMode = !state.fogMode;
        saveJSON(STORAGE.fog, state.fogMode);
        renderNestMotes();
      });
    }

    const sensory = document.getElementById("sensory-flare-toggle");
    if (sensory) {
      sensory.addEventListener("click", () => {
        state.sensoryFlare = !state.sensoryFlare;
        saveJSON(STORAGE.sensory, state.sensoryFlare);
        sensory.setAttribute("aria-checked", state.sensoryFlare ? "true" : "false");
        document.body.classList.toggle("sensory-flare", state.sensoryFlare);
        document.body.classList.toggle("sensory-flare-mode", state.sensoryFlare);
        updateEnergyState(state.energyLevel);
      });
    }

  }

  function bindNapToggle() {
    const toggle = document.getElementById("nap-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => toggleNapMode());
      toggle.setAttribute("aria-checked", state.isNapMode ? "true" : "false");
    }
    syncNapButtons();
  }

  function syncNapButtons() {
    const toggle = document.getElementById("nap-toggle");
    if (toggle) toggle.setAttribute("aria-checked", state.isNapMode ? "true" : "false");
  }

  function setMainScreen(screen) {
    const frame = document.getElementById("app-frame");
    document.querySelectorAll(".app-screen").forEach((el) => el.classList.remove("screen-active"));

    if (screen === "add") {
      document.getElementById("screen-add").classList.add("screen-active");
      frame.classList.add("nav-hidden");
    } else {
      document.getElementById(`screen-${screen}`).classList.add("screen-active");
      frame.classList.remove("nav-hidden");
      document.querySelectorAll(".nav-btn").forEach((b) => {
        const active = b.dataset.screen === screen;
        b.classList.toggle("nav-active", active);
        b.setAttribute("aria-current", active ? "page" : "false");
      });
    }

    if (screen === "jar") {
      renderJar();
      renderSkyMap();
    }
  }

  function bindNav() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => setMainScreen(btn.dataset.screen));
    });
  }

  function getTemplateCategories(kind) {
    return [...new Set(TASK_TEMPLATES.filter((t) => t.kind === kind).map((t) => t.category))].sort();
  }

  function syncSpoonsIntensity() {
    const spoonsEl = document.getElementById("task-spoons");
    const hiddenIntensity = document.getElementById("habit-intensity");
    const labelIntensity = document.getElementById("habit-intensity-label");
    if (!spoonsEl || !hiddenIntensity || !labelIntensity) return;
    const spoons = Math.max(1, Math.min(12, Number(spoonsEl.value) || 3));
    spoonsEl.value = String(spoons);
    const intensity = getIntensityFromSpoons(spoons);
    hiddenIntensity.value = intensity;
    labelIntensity.value = `${getIntensityLabel(intensity)} (${spoons} spoon${spoons === 1 ? "" : "s"})`;
  }

  function populateTaskCategories() {
    const kindSel = document.getElementById("task-kind");
    const categorySel = document.getElementById("task-category");
    if (!kindSel || !categorySel) return;
    const categories = getTemplateCategories(kindSel.value || "habit");
    categorySel.innerHTML = "";
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categorySel.appendChild(opt);
    });
  }

  function populateTaskTemplates() {
    const kindSel = document.getElementById("task-kind");
    const categorySel = document.getElementById("task-category");
    const templateSel = document.getElementById("task-template");
    if (!kindSel || !categorySel || !templateSel) return;
    const kind = kindSel.value || "habit";
    const category = categorySel.value || "";
    templateSel.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Custom — I’ll write my own";
    templateSel.appendChild(blank);
    TASK_TEMPLATES.filter((t) => t.kind === kind && t.category === category).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      templateSel.appendChild(opt);
    });
  }

  function initChoreTemplateSelect() {
    populateTaskCategories();
    populateTaskTemplates();
    syncSpoonsIntensity();
  }

  function applyChoreTemplate(templateId) {
    const form = document.getElementById("habit-form-screen");
    if (!form) return;
    const t = TASK_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    form.elements.kind.value = t.kind;
    populateTaskCategories();
    form.elements.category.value = t.category;
    populateTaskTemplates();
    form.elements.template.value = t.id;
    form.elements.name.value = t.name;
    form.elements.spoons.value = String(t.spoons || 3);
    form.elements.lvl1.value = t.level1;
    form.elements.lvl2.value = t.level2;
    form.elements.lvl3.value = t.level3;
    syncSpoonsIntensity();
  }

  function bindAddHabitScreen() {
    document.getElementById("btn-add-habit").addEventListener("click", () => {
      document.getElementById("habit-form-screen").reset();
      const kindSel = document.getElementById("task-kind");
      if (kindSel) kindSel.value = "habit";
      initChoreTemplateSelect();
      setMainScreen("add");
    });
    document.getElementById("btn-add-back").addEventListener("click", () => setMainScreen("lab"));
    document.getElementById("habit-form-screen").addEventListener("submit", onHabitFormScreenSubmit);
    const kindSel = document.getElementById("task-kind");
    const categorySel = document.getElementById("task-category");
    const templateSel = document.getElementById("task-template");
    const spoonsEl = document.getElementById("task-spoons");
    if (kindSel) {
      kindSel.addEventListener("change", () => {
        populateTaskCategories();
        populateTaskTemplates();
      });
    }
    if (categorySel) {
      categorySel.addEventListener("change", populateTaskTemplates);
    }
    if (templateSel) {
      templateSel.addEventListener("change", () => {
        const id = templateSel.value;
        if (id) applyChoreTemplate(id);
      });
    }
    if (spoonsEl) {
      spoonsEl.addEventListener("input", syncSpoonsIntensity);
      spoonsEl.addEventListener("change", syncSpoonsIntensity);
    }
  }

  function openMorningModal() {
    const modal = document.getElementById("morning-modal");
    const backdrop = document.getElementById("morning-backdrop");
    const picker = document.getElementById("energy-picker");
    const labelEl = document.getElementById("energy-label");
    picker.innerHTML = "";
    state.tempMorningEnergy = state.energyLevel;

    EMOJI_LEVELS.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "emoji-chip";
      b.textContent = item.emoji;
      b.setAttribute("aria-label", `Energy ${item.level}: ${item.label}`);
      b.setAttribute("aria-pressed", item.level === state.tempMorningEnergy ? "true" : "false");
      b.addEventListener("click", () => {
        state.tempMorningEnergy = item.level;
        picker.querySelectorAll(".emoji-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        if (labelEl) labelEl.textContent = item.label;
        updateCheckinSprite(item.level);
      });
      picker.appendChild(b);
    });

    const cur = EMOJI_LEVELS.find((e) => e.level === state.tempMorningEnergy);
    if (labelEl) labelEl.textContent = cur ? cur.label : "";
    updateCheckinSprite(state.tempMorningEnergy);

    modal.hidden = false;
    backdrop.hidden = false;
  }

  function closeMorningModal() {
    document.getElementById("morning-modal").hidden = true;
    document.getElementById("morning-backdrop").hidden = true;
  }

  function bindMorningModal() {
    document.getElementById("morning-skip").addEventListener("click", () => {
      state.morningDoneDate = getTodayStr();
      setScopedItem(STORAGE.morningDone, state.morningDoneDate);
      closeMorningModal();
      renderNestMotes();
    });
    document.getElementById("morning-save").addEventListener("click", () => {
      updateEnergyState(state.tempMorningEnergy);
      state.morningDoneDate = getTodayStr();
      setScopedItem(STORAGE.morningDone, state.morningDoneDate);
      const today = getTodayStr();
      syncDailyRecord(today);
      if (state.daily[today]) {
        state.daily[today].energy = state.energyLevel;
        saveJSON(STORAGE.daily, state.daily);
      }
      closeMorningModal();
      renderNestMotes();
    });
  }

  function onHabitFormScreenSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const kind = String(fd.get("kind") || "habit");
    const category = String(fd.get("category") || "").trim();
    const spoons = Math.max(1, Math.min(12, Number(fd.get("spoons")) || 3));
    const intensity = getIntensityFromSpoons(spoons);
    const habit = {
      id: crypto.randomUUID ? crypto.randomUUID() : `h-${Date.now()}`,
      name: String(fd.get("name") || "").trim(),
      kind: kind === "chore" ? "chore" : "habit",
      category: category || (kind === "chore" ? "Whole home" : "General"),
      spoons,
      intensity,
      level1: String(fd.get("lvl1") || "").trim(),
      level2: String(fd.get("lvl2") || "").trim(),
      level3: String(fd.get("lvl3") || "").trim(),
    };
    if (!habit.name) return;
    state.habits.push(habit);
    saveJSON(STORAGE.habits, state.habits);
    setMainScreen("lab");
    renderHabitList();
    renderNestMotes();
  }

  function miniPreviewSvg(intensity) {
    const cls = intensity === "high" ? "high" : intensity === "low" ? "low" : "medium";
    const src =
      intensity === "high"
        ? "dust-excited.png"
        : intensity === "low"
          ? "dust-sad.png"
          : "dust-resting.png";
    return `<div class="habit-sprite-preview ${cls}" title="Sprite mood for your “full” version"><img class="habit-sprite-img" src="${src}" alt="" width="96" height="96" decoding="async" /></div>`;
  }

  function renderHabitList() {
    const ul = document.getElementById("habit-list");
    const today = getTodayStr();
    ul.innerHTML = "";
    if (!state.habits.length) {
      const li = document.createElement("li");
      li.className = "muted small";
      li.style.listStyle = "none";
      li.textContent = "No habits yet. Add a habit or chore — your sprite will show a tiny preview for big tasks.";
      ul.appendChild(li);
      return;
    }
    state.habits.forEach((h) => {
      const inten = h.intensity || "medium";
      const preview = miniPreviewSvg(inten);
      const hasProgress = state.history.some((e) => e.habitId === h.id);
      const stampedToday = state.history.some((e) => e.habitId === h.id && e.date === today);
      const spoonCount = Math.max(1, Number(h.spoons) || 3);
      const meta = `${h.kind === "chore" ? "Chore" : "Habit"} • ${h.category} • ${spoonCount} spoon${spoonCount === 1 ? "" : "s"}`;
      const li = document.createElement("li");
      li.className = "habit-card" + (hasProgress ? " habit-card--with-motes" : "") + (stampedToday ? " habit-card--stamped" : "");
      li.dataset.habitId = h.id;
      li.innerHTML = `
        <div class="task-intent muted small">${meta} • ${getIntensityLabel(inten)}</div>
        <div class="habit-card-top">
          <h3>${escapeHtml(h.name)}</h3>
          ${preview}
        </div>
        <p class="habit-preview l1"><strong>L1</strong> ${escapeHtml(h.level1)}</p>
        <p class="habit-preview l2"><strong>L2</strong> ${escapeHtml(h.level2)}</p>
        <p class="habit-preview l3"><strong>L3</strong> ${escapeHtml(h.level3)}</p>
        <div class="habit-card-actions">
          <button type="button" class="btn-ghost" data-delete="${h.id}">Delete</button>
        </div>`;
      li.querySelector("[data-delete]").addEventListener("click", () => {
        state.habits = state.habits.filter((x) => x.id !== h.id);
        saveJSON(STORAGE.habits, state.habits);
        renderHabitList();
        renderNestMotes();
      });
      ul.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderJar() {
    const stack = document.getElementById("jar-stack");
    stack.innerHTML = "";
    const dots = state.history.slice(-80);
    dots.forEach((h) => {
      const d = document.createElement("div");
      d.className = `jar-mote-dot lvl${h.level}`;
      if (h.level === 3 && (h.energy ?? 3) <= 2) d.classList.add("gold-low-energy");
      stack.appendChild(d);
    });
  }

  function iconStar() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--color-mote-lvl3)" d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.8 6.4 19.5l2.1-6.7L3 8.8h6.8L12 2z"/></svg>`;
  }

  function iconCloud() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--color-mote-lvl2)" opacity="0.78" d="M18.3 18H7.7A4.7 4.7 0 0 1 4 13.5c0-2 1.3-3.7 3.1-4.3A5.5 5.5 0 0 1 17 10.1a3.8 3.8 0 0 1 1.3 7.9z"/></svg>`;
  }

  function iconMoon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--text-muted)" d="M21 14.5A8.5 8.5 0 0 1 9.5 3a6.5 6.5 0 1 0 11.5 11.5z"/></svg>`;
  }

  function renderSkyMap() {
    const grid = document.getElementById("skymap");
    const cap = document.getElementById("skymap-caption");
    grid.innerHTML = "";

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const monthName = now.toLocaleString("default", { month: "long" });
    cap.textContent = `${monthName} ${y} — moon for nap days, stars for brighter check-ins, soft clouds when you logged a gentler day or finished something.`;

    const rows = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < rows; i += 1) {
      const cell = document.createElement("div");
      cell.className = "skymap-cell";
      const dayNum = i - firstDay + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        cell.textContent = "";
        cell.style.opacity = "0.35";
      } else {
        const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        const compsDay = state.history.filter((h) => h.date === key);
        const rec = state.daily[key];
        cell.textContent = String(dayNum);
        let icon = "";
        let tip = `Day ${dayNum}`;
        if (rec && rec.nap) {
          icon = iconMoon();
          tip = "Sprite nap day";
        } else if (rec && rec.energy >= 4) {
          icon = iconStar();
          tip = "Higher-energy day";
        } else if (compsDay.length) {
          icon = iconCloud();
          tip = "You moved something forward";
        } else if (rec && (rec.energy ?? 5) <= 3) {
          icon = iconCloud();
          tip = "Softer check-in";
        }
        if (icon) {
          cell.textContent = "";
          cell.innerHTML = icon;
          cell.title = tip;
        }
      }
      grid.appendChild(cell);
    }
  }

  function enterMainApp() {
    const login = document.getElementById("screen-login");
    const frame = document.getElementById("app-frame");
    if (login) login.classList.remove("screen-active");
    if (frame) frame.classList.remove("nav-hidden");
    setMainScreen("nest");
  }

  function bindLoginForm() {
    const form = document.getElementById("login-form");
    const statusEl = document.getElementById("login-status");
    if (!form || form.dataset.loginBound === "1") return;
    form.dataset.loginBound = "1";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const action = String(fd.get("auth_action") || (e.submitter && e.submitter.value) || "signin");
      const email = normalizeEmail(form.elements.email && form.elements.email.value);
      const password = String(form.elements.password && form.elements.password.value || "");
      const displayName = String(form.elements.displayName && form.elements.displayName.value || "").trim();
      if (action === "demo") {
        state.currentUserEmail = "demo@dustbound.local";
        state.currentUserProfile = { displayName: "Demo" };
        localStorage.setItem(AUTH_STORAGE.session, state.currentUserEmail);
        localStorage.setItem("userLoggedIn", "1");
        if (statusEl) statusEl.textContent = "Demo mode enabled.";
        enterMainApp();
        initApp();
        return;
      }
      if (!isValidEmail(email)) {
        if (statusEl) statusEl.textContent = "Please enter a valid email address.";
        showToast("Enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        if (statusEl) statusEl.textContent = "Password must be at least 6 characters.";
        showToast("Password must be at least 6 characters.");
        return;
      }

      const accounts = getAccounts();
      if (action === "signup") {
        if (displayName.length < 2) {
          if (statusEl) statusEl.textContent = "Add a profile name (at least 2 characters) to create an account.";
          showToast("Add a profile name to create an account.");
          return;
        }
        if (accounts[email]) {
          if (statusEl) statusEl.textContent = "That account already exists. Use Sign In.";
          showToast("Account already exists. Sign in instead.");
          return;
        }
        accounts[email] = {
          email,
          password,
          createdAt: Date.now(),
          profile: {
            displayName,
            createdAt: Date.now(),
          },
        };
        saveAccounts(accounts);
      } else {
        if (!accounts[email] || accounts[email].password !== password) {
          if (statusEl) statusEl.textContent = "Email or password is incorrect.";
          showToast("Incorrect email or password.");
          return;
        }
      }

      state.currentUserEmail = email;
      state.currentUserProfile = (accounts[email] && accounts[email].profile) || null;
      localStorage.setItem(AUTH_STORAGE.session, email);
      localStorage.setItem("userLoggedIn", "1");
      if (statusEl) {
        statusEl.textContent =
          action === "signup"
            ? `Account created for ${displayName}.`
            : `Signed in${state.currentUserProfile && state.currentUserProfile.displayName ? ` as ${state.currentUserProfile.displayName}` : ""}.`;
      }
      enterMainApp();
      initApp();
    });
  }

  function formatSplashDateTime(now) {
    const d = now instanceof Date ? now : new Date();
    const datePart = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} • ${timePart}`;
  }

  function startSplashClock() {
    const el = document.getElementById("splash-datetime");
    if (!el) return () => {};
    const update = () => {
      el.textContent = formatSplashDateTime(new Date());
    };
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }

  function boot() {
    const splash = document.getElementById("screen-splash");
    const login = document.getElementById("screen-login");
    const splashVideo = document.getElementById("splash-video");
    const splashCanvas = document.getElementById("splash-canvas");

    bindLoginForm();
    if (!splash || !login) return;

    if (splashVideo && splashCanvas) {
      setupSplashChromaKey(splashVideo, splashCanvas);
    }
    const stopSplashClock = startSplashClock();

    window.setTimeout(() => {
      stopSplashClock();
      splash.classList.remove("screen-active");
      splash.hidden = true;
      login.classList.add("screen-active");
    }, 8000);
  }

  function setupSplashChromaKey(video, canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let active = true;
    const stopIfHidden = () => {
      if (!document.getElementById("screen-splash") || document.getElementById("screen-splash").hidden) {
        active = false;
      }
    };

    const key = { r: 255, g: 0, b: 255 };
    const hardCut = 56;
    const softCut = 150;

    const processFrame = () => {
      stopIfHidden();
      if (!active) return;
      if (video.readyState >= 2) {
        const vw = video.videoWidth || 1;
        const vh = video.videoHeight || 1;
        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dr = Math.abs(r - key.r);
          const dg = Math.abs(g - key.g);
          const db = Math.abs(b - key.b);
          const d = Math.max(dr, dg, db);
          const magentaLike = r > 95 && b > 95 && g < 160 && Math.abs(r - b) < 130 && (r + b - (g * 2)) > 48;

          if (d <= hardCut || (magentaLike && g < 90)) {
            data[i + 3] = 0;
          } else if (d < softCut || magentaLike) {
            const alphaFactor = Math.max(0, Math.min(1, (d - hardCut) / (softCut - hardCut)));
            const magentaPenalty = magentaLike ? 0.35 : 1;
            data[i + 3] = Math.round(data[i + 3] * alphaFactor * magentaPenalty);
          }

          // Aggressive despill to suppress remaining magenta fringe.
          if (magentaLike) {
            data[i] = Math.round((r * 0.15) + (g * 0.85));
            data[i + 2] = Math.round((b * 0.15) + (g * 0.85));
          } else if (dr < softCut && db < softCut && g < 160) {
            data[i] = Math.min(r, g + 16);
            data[i + 2] = Math.min(b, g + 16);
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(processFrame);
      } else {
        requestAnimationFrame(processFrame);
      }
    };

    video.play().catch(() => {});
    if (video.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(processFrame);
    } else {
      requestAnimationFrame(processFrame);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
