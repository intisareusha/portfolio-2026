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

  const EMAIL = "hello@clipstack.com";

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

  /* -------------------------------------------------------- work carousel */
  const workCards = $$(".work-card");
  const gallery = $("#work-gallery");
  const track = $("#work-track");

  if (gallery && track && workCards.length) {
    const CURVE = 46; // how far the arc lifts cards off the baseline
    const MAX_TILT = 5; // degrees of fan rotation at the edges
    const ease = prefersReduced() ? 1 : 0.2;
    let current = 0.5;
    let target = 0.5;
    let maxScroll = 0;
    let galleryWidth = 0;
    let frame = null;
    let dragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartTarget = 0;

    const measure = () => {
      galleryWidth = gallery.clientWidth;
      maxScroll = Math.max(0, track.scrollWidth - galleryWidth);
    };

    const draw = () => {
      frame = null;
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0005) current = target;

      const shift = -current * maxScroll;
      track.style.transform = `translate3d(${shift}px, 0, 0)`;

      const centre = galleryWidth / 2;
      workCards.forEach((card) => {
        const cardCentre = card.offsetLeft + card.offsetWidth / 2 + shift;
        const rel = Math.max(-1.15, Math.min(1.15, (cardCentre - centre) / centre));
        const lift = -CURVE * Math.max(0, 1 - rel * rel);
        const tilt = rel * MAX_TILT;
        card.style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      });

      if (current !== target) frame = requestAnimationFrame(draw);
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(draw);
    };

    // Press-and-hold, then drag left/right to slide the cards. The row only
    // moves while the pointer is down, so a plain click still opens the clip.
    gallery.addEventListener("pointerdown", (event) => {
      dragging = true;
      dragMoved = false;
      dragStartX = event.clientX;
      // Grab from wherever the cards currently sit so the row doesn't jump.
      target = current;
      dragStartTarget = current;
      if (gallery.setPointerCapture) {
        try {
          gallery.setPointerCapture(event.pointerId);
        } catch (error) {
          /* pointer capture is best-effort */
        }
      }
    });
    gallery.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      if (Math.abs(dx) > 6) dragMoved = true;
      target = Math.max(0, Math.min(1, dragStartTarget - dx / (maxScroll || 1)));
      schedule();
    });
    const endDrag = () => {
      dragging = false;
    };
    gallery.addEventListener("pointerup", endDrag);
    gallery.addEventListener("pointercancel", endDrag);
    gallery.addEventListener("pointerleave", endDrag);

    // Swallow the click that ends a drag so it doesn't open the lightbox.
    gallery.addEventListener(
      "click",
      (event) => {
        if (!dragMoved) return;
        event.stopPropagation();
        event.preventDefault();
        dragMoved = false;
      },
      true
    );

    gallery.setAttribute("tabindex", "0");
    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        target = Math.min(1, target + 0.24);
        schedule();
      } else if (event.key === "ArrowLeft") {
        target = Math.max(0, target - 0.24);
        schedule();
      }
    });

    window.addEventListener("resize", () => {
      measure();
      schedule();
    });
    window.addEventListener("load", () => {
      measure();
      schedule();
    });
    measure();
    draw();
  }

  /* ------------------------------------------------------------- hero reel */
  const heroReel = $("#hero-reel");
  const heroSound = $("#hero-sound");
  const heroSection = $("#home");

  if (heroReel && heroSound) {
    let wantSound = true;

    const syncSoundButton = () => {
      const muted = heroReel.muted;
      heroSound.classList.toggle("is-muted", muted);
      heroSound.setAttribute("aria-pressed", String(!muted));
      heroSound.setAttribute("aria-label", muted ? "Unmute showreel" : "Mute showreel");
    };

    const playHero = () => {
      heroReel.muted = !wantSound;
      const attempt = heroReel.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          // Autoplay with sound was blocked — start muted so it still plays.
          if (wantSound) {
            heroReel.muted = true;
            syncSoundButton();
          }
          const retry = heroReel.play();
          if (retry && typeof retry.catch === "function") retry.catch(() => {});
        });
      }
    };

    heroSound.addEventListener("click", () => {
      wantSound = !wantSound;
      heroReel.muted = !wantSound;
      syncSoundButton();
      playHero();
    });

    // Browsers block autoplay-with-sound until the visitor interacts: turn the
    // sound back on at the first interaction unless they muted it themselves.
    const unlockSound = () => {
      if (wantSound && heroReel.muted) {
        heroReel.muted = false;
        syncSoundButton();
      }
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
    };
    window.addEventListener("pointerdown", unlockSound);
    window.addEventListener("keydown", unlockSound);

    if (heroSection && "IntersectionObserver" in window && !prefersReduced()) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) playHero();
            else heroReel.pause();
          });
        },
        { threshold: 0.15 }
      );
      heroObserver.observe(heroSection);
    } else if (!prefersReduced()) {
      playHero();
    }

    syncSoundButton();
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

    const visibleWorkTriggers = () => workCards.map((card) => card.querySelector("[data-reel]")).filter(Boolean);

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
      lbVideo.muted = false;
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
      return [
        `Name: ${fields.name.value.trim()}`,
        `Email: ${fields.email.value.trim()}`,
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
})();
