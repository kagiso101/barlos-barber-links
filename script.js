// Barlos Cuts: open/closed status, service picker -> WhatsApp, copy buttons.
(() => {
  const WA_NUMBER = "27788319807";
  const OPEN_HOUR = 8;   // 8 am
  const CLOSE_HOUR = 22; // 10 pm

  /* ---------- Open now, in Cape Town time ---------- */
  function capeTownNow() {
    const parts = new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      weekday: "short",
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return { day: days.indexOf(get("weekday")), hour: Number(get("hour")) };
  }

  function updateStatus() {
    const { day, hour } = capeTownNow();
    const open = hour >= OPEN_HOUR && hour < CLOSE_HOUR;

    const main = open ? "Open now" : "Closed now";
    const sub = open
      ? "Until 10 pm tonight"
      : hour < OPEN_HOUR ? "Opens at 8 am" : "Opens tomorrow at 8 am";

    document.querySelectorAll(".js-status").forEach((el) => (el.textContent = main));
    document.querySelectorAll(".js-status-sub").forEach((el) => (el.textContent = sub));
    document.querySelectorAll(".status-card, .live").forEach((el) => {
      el.classList.toggle("is-open", open);
      el.classList.toggle("is-closed", !open);
    });

    document.querySelectorAll(".hours tr").forEach((row) => {
      row.classList.toggle("today", Number(row.dataset.day) === day);
    });
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- Service picker -> WhatsApp message ---------- */
  const chips = [...document.querySelectorAll(".chip")];
  const waLinks = [...document.querySelectorAll("[data-wa]")];
  const count = document.querySelector(".js-count");
  const clear = document.querySelector(".js-clear");
  const dockLabel = document.querySelector(".js-dock-label");

  function picked() {
    return chips
      .filter((c) => c.getAttribute("aria-pressed") === "true")
      .map((c) => c.textContent.trim());
  }

  function buildMessage(list) {
    if (!list.length) return "Hi Barlos, I'd like to book a slot.";
    return (
      "Hi Barlos, I'd like to book:\n" +
      list.map((s) => "• " + s).join("\n") +
      "\n\nWhat times do you have?"
    );
  }

  function refresh() {
    const list = picked();
    const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMessage(list))}`;
    waLinks.forEach((a) => (a.href = href));

    if (count) {
      count.textContent = list.length
        ? `${list.length} picked: ${list.join(", ")}.`
        : "Nothing picked yet.";
    }
    if (clear) clear.hidden = list.length === 0;
    if (dockLabel) {
      dockLabel.textContent = list.length
        ? `Book ${list.length} on WhatsApp`
        : "Book on WhatsApp";
    }
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const on = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", String(!on));
      refresh();
    })
  );

  clear?.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
    refresh();
  });

  refresh();

  /* ---------- Copy number ---------- */
  const toast = document.querySelector(".toast");
  let toastTimer;

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  document.querySelectorAll(".copy").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        showToast(`Copied ${value}`);
      } catch {
        showToast(value);
      }
    })
  );

  /* ---------- Footer year ---------- */
  document.querySelectorAll(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
