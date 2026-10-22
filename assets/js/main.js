/* ==========================================================================
   Hanifeh Farahzadi — short-form studio
   All interactive behaviour: nav, accordion, testimonial slider, work filter,
   video previews + lightbox, contact form.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const prefersReduced = () => reduceQuery.matches;
  const canHover = () => hoverQuery.matches;

  const EMAIL = "hello@hanifeh.studio";

  /* ---------------------------------------------------------------- header */
  const topbar = $("#topbar");
  const onScrollHeader = () => {
    if (!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  /* ---------------------------------------------------- smooth scroll + nav */
  const sections = ["home", "about", "work", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const dockLinks = $$(".dock__link");

  const setActiveNav = (id) => {
    dockLinks.forEach((link) => {
      const active = link.dataset.nav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const scrollToTarget = (hash) => {
    const id = hash.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;
    const top =
      id === "home"
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - (window.innerWidth > 720 ? 84 : 70);
    window.scrollTo({ top, behavior: prefersReduced() ? "auto" : "smooth" });
    setActiveNav(id);
    if (history.replaceState) history.replaceState(null, "", `#${id}`);
  };

  $$("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href") || "";
      if (!hash.startsWith("#")) return;
      event.preventDefault();
      scrollToTarget(hash);
    });
  });

  let scrollFrame = null;
  const updateActiveOnScroll = () => {
    scrollFrame = null;
    const probe = window.scrollY + window.innerHeight * 0.32;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= probe) current = section;
    });
    if (current) setActiveNav(current.id);
  };

  window.addEventListener(
    "scroll",
    () => {
      onScrollHeader();
      if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateActiveOnScroll);
    },
    { passive: true }
  );
  onScrollHeader();
  updateActiveOnScroll();

  /* -------------------------------------------------------------- reveal */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced()) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el, i) => {
      const delay = Number(el.dataset.delay || 0);
      el.style.setProperty("--reveal-delay", `${delay || (i % 4) * 60}ms`);
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* --------------------------------------------------- pointer spotlight */
  if (canHover()) {
    $$("[data-spotlight], .work-card").forEach((el) => {
      el.addEventListener(
        "pointermove",
        (event) => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          el.style.setProperty("--my", `${event.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });
  }

  /* ------------------------------------------------------------- counters */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const decimals = String(target).includes(".") ? 1 : 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if ("IntersectionObserver" in window && !prefersReduced()) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    } else {
      counters.forEach((el) => {
        el.textContent = parseFloat(el.dataset.count).toFixed(String(el.dataset.count).includes(".") ? 1 : 0);
      });
    }
  }

  /* ---------------------------------------------------- services accordion */
  const serviceItems = $$(".service");
  const serviceButtons = $$(".service__toggle");

  const setServiceState = (button, open) => {
    const item = button.closest(".service");
    button.setAttribute("aria-expanded", String(open));
    if (item) item.classList.toggle("is-open", open);
  };

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      serviceButtons.forEach((other) => setServiceState(other, false));
      setServiceState(button, !isOpen);
    });
  });

  // Service CTAs prefill the contact form (both lists share the same order).
  const serviceSelect = $("#service");
  $$(".service__panel .text-link").forEach((link) => {
    link.addEventListener("click", () => {
      const item = link.closest(".service");
      const index = serviceItems.indexOf(item);
      if (serviceSelect && index > -1 && serviceSelect.options[index + 1]) {
        serviceSelect.selectedIndex = index + 1;
      }
    });
  });

  /* -------------------------------------------------- testimonial slider */
  const quoteEls = $$("[data-quote]");
  const dotEls = $$("#quote-dots .dot");
  const quotesWrapper = $("#quotes");
  const testimonialsCard = quotesWrapper ? quotesWrapper.closest(".card") : null;
  let quoteIndex = 0;
  let quoteTimer = null;

  const showQuote = (index) => {
    if (!quoteEls.length) return;
    quoteIndex = (index + quoteEls.length) % quoteEls.length;
    quoteEls.forEach((quote, i) => quote.classList.toggle("is-active", i === quoteIndex));
    dotEls.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === quoteIndex);
      dot.setAttribute("aria-selected", String(i === quoteIndex));
    });
  };

  const startQuoteTimer = () => {
    if (prefersReduced() || quoteTimer) return;
    quoteTimer = window.setInterval(() => showQuote(quoteIndex + 1), 6500);
  };
  const stopQuoteTimer = () => {
    window.clearInterval(quoteTimer);
    quoteTimer = null;
  };

  if (quoteEls.length) {
    dotEls.forEach((dot, i) => dot.addEventListener("click", () => showQuote(i)));
    const prev = $("#quote-prev");
    const next = $("#quote-next");
    if (prev) prev.addEventListener("click", () => showQuote(quoteIndex - 1));
    if (next) next.addEventListener("click", () => showQuote(quoteIndex + 1));
    if (testimonialsCard) {
      testimonialsCard.addEventListener("pointerenter", stopQuoteTimer);
      testimonialsCard.addEventListener("pointerleave", startQuoteTimer);
      testimonialsCard.addEventListener("focusin", stopQuoteTimer);
      testimonialsCard.addEventListener("focusout", startQuoteTimer);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopQuoteTimer();
      else startQuoteTimer();
    });

    let touchStartX = null;
    if (quotesWrapper) {
      quotesWrapper.addEventListener(
        "touchstart",
        (event) => {
          touchStartX = event.changedTouches[0].clientX;
        },
        { passive: true }
      );
      quotesWrapper.addEventListener(
        "touchend",
        (event) => {
          if (touchStartX === null) return;
          const delta = event.changedTouches[0].clientX - touchStartX;
          if (Math.abs(delta) > 40) showQuote(quoteIndex + (delta < 0 ? 1 : -1));
          touchStartX = null;
        },
        { passive: true }
      );
    }

    startQuoteTimer();
    showQuote(0);
  }

  /* -------------------------------------------------------- work previews */
  const workCards = $$(".work-card");

  workCards.forEach((card) => {
    const video = $("video", card);
    if (!video) return;

    card.addEventListener("pointerenter", () => {
      if (!canHover() || prefersReduced()) return;
      card.classList.add("is-previewing");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
    });

    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-previewing");
      video.pause();
      try {
        video.currentTime = 0;
      } catch (error) {
        /* ignore seek errors on partially loaded clips */
      }
    });
  });

  /* ------------------------------------------------------------- filtering */
  const filterButtons = $$(".filters .filter");
  const emptyNote = $("#work-empty");

  const applyFilter = (filter) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    let visible = 0;
    workCards.forEach((card, i) => {
      const show = filter === "all" || card.dataset.cat === filter;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
        card.classList.add("is-in");
        card.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 55}ms`);
      }
    });

    if (emptyNote) emptyNote.hidden = visible > 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });
  if (emptyNote) {
    const reset = $("[data-filter='all']", emptyNote);
    if (reset) reset.addEventListener("click", () => applyFilter("all"));
  }

  /* --------------------------------------------------------- video lightbox */
  const lightbox = $("#lightbox");
  const lbVideo = $("#lb-video");
  const lbLoading = $("#lb-loading");
  const lbTitle = $("#lb-title");
  const lbCat = $("#lb-cat");
  const lbDesc = $("#lb-desc");
  const lbClient = $("#lb-client");
  const lbMeta = $("#lb-meta");
  const lbCount = $("#lb-count");

  if (lightbox && lbVideo) {
    const triggers = $$("[data-reel]");
    let currentIndex = 0;
    let lastTrigger = null;

    const visibleWorkTriggers = () => {
      const list = workCards.filter((card) => !card.classList.contains("is-hidden")).map((card) => card.querySelector("[data-reel]"));
      return list.filter(Boolean);
    };

    let loadingTimer = null;
    const hideLoading = () => {
      window.clearTimeout(loadingTimer);
      if (lbLoading) lbLoading.hidden = true;
    };

    const fillLightbox = (trigger) => {
      const data = trigger.dataset;
      if (lbTitle) lbTitle.textContent = data.title || "Project";
      if (lbCat) lbCat.textContent = data.catLabel || "Selected work";
      if (lbDesc) lbDesc.textContent = data.desc || "";
      if (lbClient) lbClient.textContent = data.client || "Client";
      if (lbMeta) lbMeta.textContent = data.meta || "";
      if (lbLoading) {
        lbLoading.hidden = false;
        lbLoading.textContent = "Loading clip…";
      }
      // Prefer WebM when the browser supports it, fall back to H.264 MP4.
      const webmOk = data.webm && lbVideo.canPlayType('video/webm; codecs="vp9"');
      lbVideo.poster = data.poster || "";
      lbVideo.src = webmOk ? data.webm : data.reel;
      lbVideo.load();
      const playPromise = lbVideo.play();
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
      window.clearTimeout(loadingTimer);
      loadingTimer = window.setTimeout(hideLoading, 6000);
      const list = visibleWorkTriggers();
      const position = list.indexOf(trigger);
      if (lbCount) lbCount.textContent = `${position > -1 ? position + 1 : 1} / ${Math.max(list.length, 1)}`;
    };

    const openLightbox = (trigger) => {
      if (!trigger.closest(".work-card")) {
        // Featured card: make sure its project is visible in the grid first.
        const match = workCards.find((card) => {
          const btn = card.querySelector("[data-reel]");
          return btn && btn.dataset.reel === trigger.dataset.reel;
        });
        if (match && match.classList.contains("is-hidden")) applyFilter("all");
      }
      const list = visibleWorkTriggers();
      const index = list.findIndex((item) => item.dataset.reel === trigger.dataset.reel);
      currentIndex = index > -1 ? index : 0;
      fillLightbox(trigger);
      lastTrigger = trigger;
      if (typeof lightbox.showModal === "function") lightbox.showModal();
      else {
        lightbox.setAttribute("open", "");
        document.documentElement.style.overflow = "hidden";
      }
    };

    const stepLightbox = (direction) => {
      const list = visibleWorkTriggers();
      if (!list.length) return;
      currentIndex = (currentIndex + direction + list.length) % list.length;
      fillLightbox(list[currentIndex]);
    };

    const closeLightbox = () => {
      if (typeof lightbox.close === "function" && lightbox.open) lightbox.close();
      else lightbox.removeAttribute("open");
      document.documentElement.style.overflow = "";
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openLightbox(trigger));
    });

    const closeBtn = $("#lb-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    const prevBtn = $("#lb-prev");
    const nextBtn = $("#lb-next");
    if (prevBtn) prevBtn.addEventListener("click", () => stepLightbox(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => stepLightbox(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }
    });

    lightbox.addEventListener("close", () => {
      lbVideo.pause();
      lbVideo.removeAttribute("src");
      lbVideo.load();
      document.documentElement.style.overflow = "";
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    });

    ["loadeddata", "canplay", "playing"].forEach((type) => lbVideo.addEventListener(type, hideLoading));
    lbVideo.addEventListener("error", () => {
      if (!lightbox.open || !lbVideo.getAttribute("src")) return;
      window.clearTimeout(loadingTimer);
      if (lbLoading) {
        lbLoading.hidden = false;
        lbLoading.textContent = "This clip could not be loaded. Add the file to assets/video/ and try again.";
      }
    });
  }

  /* ------------------------------------------------------------ copy buttons */
  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* fall through to the legacy path */
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch (error) {
      return false;
    }
  };

  const flashCopied = (button, label) => {
    const labelEl = $("span", button);
    const original = labelEl ? labelEl.textContent : "";
    button.classList.add("is-copied");
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(() => {
      button.classList.remove("is-copied");
      if (labelEl) labelEl.textContent = original;
    }, 2200);
  };

  const copyEmailButton = $("#copy-email");
  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const ok = await copyText(copyEmailButton.dataset.copy || EMAIL);
      flashCopied(copyEmailButton, ok ? "Copied!" : "Select manually");
    });
  }

  /* ---------------------------------------------------------- contact form */
  const form = $("#contact-form");
  if (form) {
    const status = $("#form-status");
    const submitButton = $("#send-btn");
    const copyMessageButton = $("#copy-message");
    const fields = {
      name: $("#name"),
      email: $("#email"),
      message: $("#message"),
    };

    const setFieldError = (input, message) => {
      const field = input.closest(".field");
      const errorEl = field ? $(".field__error", field) : null;
      if (field) field.classList.toggle("has-error", Boolean(message));
      if (errorEl) {
        errorEl.textContent = message || "";
        errorEl.hidden = !message;
      }
      input.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validate = () => {
      const errors = [];
      if (!fields.name.value.trim() || fields.name.value.trim().length < 2) {
        setFieldError(fields.name, "Please tell me your name.");
        errors.push(fields.name);
      } else setFieldError(fields.name, "");

      const emailValue = fields.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
        setFieldError(fields.email, "Please enter a valid email address.");
        errors.push(fields.email);
      } else setFieldError(fields.email, "");

      if (!fields.message.value.trim() || fields.message.value.trim().length < 10) {
        setFieldError(fields.message, "A sentence or two about the project helps a lot.");
        errors.push(fields.message);
      } else setFieldError(fields.message, "");

      return errors;
    };

    const buildMessage = () => {
      const service = $("#service");
      const budget = $("#budget");
      return [
        `Name: ${fields.name.value.trim()}`,
        `Email: ${fields.email.value.trim()}`,
        `Service: ${service && service.value ? service.value : "Not specified"}`,
        `Budget: ${budget && budget.value ? budget.value : "Not specified"}`,
        "",
        "Project details:",
        fields.message.value.trim(),
      ].join("\n");
    };

    Object.values(fields).forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error")) setFieldError(input, "");
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const honeypot = $("#company");
      if (honeypot && honeypot.value) return; // silent spam trap

      const errors = validate();
      if (errors.length) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
          status.className = "form__status is-error";
        }
        errors[0].focus();
        return;
      }

      const subject = `New project enquiry — ${fields.name.value.trim()}`;
      const body = buildMessage();
      const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (submitButton) {
        const label = $(".btn__label", submitButton);
        if (label) label.textContent = "Opening…";
        window.setTimeout(() => {
          if (label) label.textContent = "Send enquiry";
        }, 1600);
      }

      window.location.href = mailto;

      if (status) {
        status.textContent = `Your email app should open with the message ready. Nothing happened? Copy the message and send it to ${EMAIL}.`;
        status.className = "form__status is-success";
      }
      if (copyMessageButton) copyMessageButton.hidden = false;
    });

    if (copyMessageButton) {
      copyMessageButton.addEventListener("click", async () => {
        const ok = await copyText(buildMessage());
        flashCopied(copyMessageButton, ok ? "Copied!" : "Copy failed");
      });
    }
  }

  /* ------------------------------------------------------------------ year */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
