const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menuInertRegions = [
  document.querySelector(".skip-link"),
  document.querySelector("main"),
  document.querySelector("footer"),
].filter(Boolean);

const getMenuFocusables = () =>
  [header?.querySelector(".brand"), menuToggle, ...navigation.querySelectorAll("a")].filter(
    (element) => element && element.getClientRects().length,
  );

const setMenu = (open, options = {}) => {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.querySelector(".sr-only").textContent = open ? "Close navigation" : "Open navigation";
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuInertRegions.forEach((region) => {
    region.inert = open;
  });

  if (open) {
    navigation.querySelector("a")?.focus({ preventScroll: true });
  } else if (options.restoreFocus) {
    menuToggle.focus({ preventScroll: true });
  }
};

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenu(open, { restoreFocus: !open });
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    const menuWasOpen = menuToggle?.getAttribute("aria-expanded") === "true";
    setMenu(false, { restoreFocus: menuWasOpen });
  });
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

window.addEventListener("resize", () => {
  if (window.innerWidth > 680) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (menuToggle?.getAttribute("aria-expanded") !== "true") return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenu(false, { restoreFocus: true });
    return;
  }

  if (event.key !== "Tab") return;

  const focusables = getMenuFocusables();
  if (!focusables.length) return;

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];
  const activeIndex = focusables.indexOf(document.activeElement);

  if (event.shiftKey && (document.activeElement === firstFocusable || activeIndex === -1)) {
    event.preventDefault();
    lastFocusable.focus({ preventScroll: true });
  } else if (!event.shiftKey && document.activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable.focus({ preventScroll: true });
  }
});

// Reveal sections only once. Content remains visible when IntersectionObserver is unavailable.
const revealItems = document.querySelectorAll("[data-reveal]");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Room directory: tabs, arrow controls, keyboard navigation, and touch swipes.
const roomExplorer = document.querySelector("[data-room-explorer]");
const roomTabs = Array.from(document.querySelectorAll("[data-room-target]"));
const roomPanels = Array.from(document.querySelectorAll("[data-room-panel]"));
const previousRoom = document.querySelector("[data-room-prev]");
const nextRoom = document.querySelector("[data-room-next]");
const currentRoom = document.querySelector("[data-current-room]");
let activeRoomIndex = Math.max(
  0,
  roomTabs.findIndex((tab) => tab.classList.contains("is-active")),
);

const selectRoom = (index, options = {}) => {
  if (!roomTabs.length || !roomPanels.length) return;

  const normalizedIndex = (index + roomTabs.length) % roomTabs.length;
  const activeTab = roomTabs[normalizedIndex];
  const roomName = activeTab.dataset.roomTarget;
  const activePanel = roomPanels.find((panel) => panel.dataset.roomPanel === roomName);

  if (!activePanel) return;

  roomTabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === normalizedIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  roomPanels.forEach((panel) => {
    const isActive = panel === activePanel;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
    panel.classList.remove("is-entering");
  });

  // Restart the entrance animation without delaying the semantic state change.
  if (!reduceMotion.matches) {
    requestAnimationFrame(() => activePanel.classList.add("is-entering"));
  }

  activeRoomIndex = normalizedIndex;
  if (currentRoom) currentRoom.textContent = String(normalizedIndex + 1).padStart(2, "0");
  if (options.focus) activeTab.focus({ preventScroll: true });
};

roomTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectRoom(index));

  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    if (event.key === "Home") selectRoom(0, { focus: true });
    else if (event.key === "End") selectRoom(roomTabs.length - 1, { focus: true });
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      selectRoom(index - 1, { focus: true });
    } else {
      selectRoom(index + 1, { focus: true });
    }
  });
});

previousRoom?.addEventListener("click", () => selectRoom(activeRoomIndex - 1));
nextRoom?.addEventListener("click", () => selectRoom(activeRoomIndex + 1));

let swipeStartX = null;
let swipeStartY = null;

roomExplorer?.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
  },
  { passive: true },
);

roomExplorer?.addEventListener(
  "touchend",
  (event) => {
    if (swipeStartX === null || swipeStartY === null) return;

    const touch = event.changedTouches[0];
    const distanceX = touch.clientX - swipeStartX;
    const distanceY = touch.clientY - swipeStartY;
    swipeStartX = null;
    swipeStartY = null;

    if (Math.abs(distanceX) < 55 || Math.abs(distanceX) < Math.abs(distanceY) * 1.3) return;
    selectRoom(activeRoomIndex + (distanceX < 0 ? 1 : -1));
  },
  { passive: true },
);

if (roomTabs.length) selectRoom(activeRoomIndex);

// Pointer-responsive depth. This is intentionally restrained so the illustrations remain readable.
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

if (supportsFinePointer && !reduceMotion.matches) {
  document.querySelectorAll("[data-room-visual]").forEach((visual) => {
    visual.addEventListener("pointermove", (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      visual.classList.add("is-tilting");
      visual.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
      visual.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    });

    visual.addEventListener("pointerleave", () => {
      visual.classList.remove("is-tilting");
      visual.style.setProperty("--tilt-x", "0deg");
      visual.style.setProperty("--tilt-y", "0deg");
    });
  });

  const heroHouse = document.querySelector("[data-house-model]");
  const heroHouseArea = heroHouse?.closest(".hero-house");

  heroHouseArea?.addEventListener("pointermove", (event) => {
    const bounds = heroHouseArea.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroHouse.style.transform = `rotateX(${(-y * 5 + 2).toFixed(2)}deg) rotateY(${(x * 8 - 4).toFixed(2)}deg) translateY(${(-Math.abs(x) * 3).toFixed(2)}px)`;
  });

  heroHouseArea?.addEventListener("pointerleave", () => {
    heroHouse.style.transform = "rotateX(2deg) rotateY(-4deg)";
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());
