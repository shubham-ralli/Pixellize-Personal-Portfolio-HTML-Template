/* ============================================================
   Personala — main.js  (vanilla, no dependencies)
   ============================================================ */
(function () {
  "use strict";

  /* ---- Header shadow on scroll ---- */
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Theme toggle (initial theme set in <head> to avoid flash) ---- */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---- Client marquee: duplicate track for a seamless loop ---- */
  var marqueeTrack = document.getElementById("marqueeTrack");
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.matches(".nav-link, .nav-cta")) {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---- Typing effect ---- */
  var typed = document.getElementById("typed");
  if (typed) {
    var words = ["fast web apps", "clean interfaces", "scalable APIs", "delightful UX"];
    var w = 0, c = 0, deleting = false;
    (function type() {
      var word = words[w];
      typed.textContent = word.slice(0, c);
      if (!deleting && c < word.length) { c++; }
      else if (deleting && c > 0) { c--; }
      else if (!deleting && c === word.length) { deleting = true; setTimeout(type, 1400); return; }
      else { deleting = false; w = (w + 1) % words.length; }
      setTimeout(type, deleting ? 45 : 90);
    })();
  }

  /* ---- Reveal on scroll + count-up + skill bars ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll("[data-count]").forEach(countUp);
      en.target.querySelectorAll(".skill-list i").forEach(function (bar) { bar.classList.add("filled"); });
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  function countUp(el) {
    var target = +el.dataset.count, start = 0, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target + "+";
    }
    requestAnimationFrame(step);
  }

  /* ---- Portfolio filter ---- */
  var filters = document.getElementById("filters");
  var works = Array.prototype.slice.call(document.querySelectorAll(".work"));
  if (filters) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      filters.querySelector(".is-active").classList.remove("is-active");
      btn.classList.add("is-active");
      var f = btn.dataset.filter;
      works.forEach(function (card) {
        card.classList.toggle("hide", f !== "all" && card.dataset.cat !== f);
      });
    });
  }

  /* ---- Portfolio modal ---- */
  var modal = document.getElementById("workModal");
  if (modal) {
    var mCat = document.getElementById("modalCat");
    var mTitle = document.getElementById("modalTitle");
    var mDesc = document.getElementById("modalDesc");
    var mTags = document.getElementById("modalTags");
    var mLink = document.getElementById("modalLink");

    var mHead = document.getElementById("modalHead");

    function openModal(card) {
      var d = card.dataset;
      mHead.style.backgroundImage = d.img ? "url('" + d.img + "')" : "";
      mCat.textContent = d.label;
      mTitle.textContent = d.title;
      mDesc.textContent = d.desc;
      mTags.textContent = d.tags || "—";
      mLink.href = d.link || "#";
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }
    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

    document.getElementById("portfolioGrid").addEventListener("click", function (e) {
      var card = e.target.closest(".work");
      if (!card) return;
      e.preventDefault();
      openModal(card);
    });
    modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* ---- Testimonials slider ---- */
  var slides = document.getElementById("slides");
  var dotsWrap = document.getElementById("dots");
  if (slides && dotsWrap) {
    var count = slides.children.length, idx = 0, timer;
    for (var i = 0; i < count; i++) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", (function (n) { return function () { go(n); reset(); }; })(i));
      dotsWrap.appendChild(d);
    }
    var dots = dotsWrap.children;
    function go(n) {
      idx = (n + count) % count;
      slides.style.transform = "translateX(" + (-idx * 100) + "%)";
      for (var k = 0; k < count; k++) dots[k].classList.toggle("active", k === idx);
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 5000); }
    go(0); reset();
  }

  /* ---- Contact form validation (front-end demo) ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    var note = document.getElementById("formNote");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "email", "message"].forEach(function (id) {
        var input = document.getElementById(id);
        var valid = input.value.trim() !== "" &&
          (id !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
        input.parentElement.classList.toggle("error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) { note.textContent = "Please fill in the required fields correctly."; note.className = "form-note err"; return; }

      var btn = form.querySelector('button[type="submit"]');
      var btnLabel = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";
      note.textContent = ""; note.className = "form-note";

      fetch("contact.php", { method: "POST", body: new FormData(form) })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: "Unexpected server response." }; }); })
        .then(function (data) {
          if (data.ok) {
            note.textContent = data.message || "Thanks! Your message has been sent.";
            note.className = "form-note ok";
            form.reset();
          } else {
            note.textContent = data.error || "Something went wrong. Please try again.";
            note.className = "form-note err";
          }
        })
        .catch(function () {
          note.textContent = "Network error. Please try again later.";
          note.className = "form-note err";
        })
        .then(function () { btn.disabled = false; btn.textContent = btnLabel; });
    });
  }

  /* ---- Premium micro-interactions (desktop, motion-safe) ---- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (finePointer && !reduceMotion) {
    /* Trailing cursor ring */
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(ring);
    var mx = 0, my = 0, rx = 0, ry = 0, shown = false;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { ring.classList.add("show"); shown = true; }
    });
    window.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget) { ring.classList.remove("show"); shown = false; }
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();

    var hoverSel = "a, button, input, textarea, .work, .card, .post";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverSel)) ring.classList.add("hovering");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverSel)) ring.classList.remove("hovering");
    });

    /* Magnetic buttons */
    var magnets = document.querySelectorAll(".btn, .theme-toggle, .to-top, .socials a");
    magnets.forEach(function (el) {
      var strength = 0.35;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * strength;
        var dy = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---- Preloader ---- */
  var preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      preloader.classList.add("hidden");
      setTimeout(function () { preloader.style.display = "none"; }, 600);
    });
    // Safety: never trap the page if 'load' already fired or stalls
    setTimeout(function () { preloader.classList.add("hidden"); }, 4000);
  }

  /* ---- FAQ accordion (single open, animated) ---- */
  var faqList = document.getElementById("faq-list");
  if (faqList) {
    faqList.addEventListener("click", function (e) {
      var q = e.target.closest(".faq-q");
      if (!q) return;
      var item = q.parentElement;
      var panel = item.querySelector(".faq-a");
      var isOpen = item.classList.contains("open");

      faqList.querySelectorAll(".faq-item.open").forEach(function (it) {
        it.classList.remove("open");
        it.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        it.querySelector(".faq-a").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  /* ---- Pricing billing toggle (animated) ---- */
  var billingSwitch = document.getElementById("billingSwitch");
  if (billingSwitch) {
    var amounts = document.querySelectorAll(".price .amount");

    function animateAmount(el, to) {
      var from = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
      var dur = 420, t0 = null;
      (function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }

    billingSwitch.addEventListener("click", function () {
      var yearly = billingSwitch.getAttribute("aria-checked") !== "true";
      billingSwitch.setAttribute("aria-checked", yearly);
      document.getElementById("btMonthly").classList.toggle("active", !yearly);
      document.getElementById("btYearly").classList.toggle("active", yearly);

      amounts.forEach(function (el) {
        var val = yearly ? el.dataset.yearly : el.dataset.monthly;
        var priceEl = el.closest(".price");
        priceEl.classList.remove("pulse");
        void priceEl.offsetWidth;      // restart animation
        priceEl.classList.add("pulse");

        if (isNaN(parseInt(val, 10))) { el.textContent = val; }  // "Custom"
        else { animateAmount(el, parseInt(val, 10)); }

        var per = priceEl.querySelector(".per");
        if (per) per.textContent = yearly ? "/yr" : "/mo";
      });
    });
  }

  /* ---- Blog listing: search + category filter ---- */
  var blogPosts = document.getElementById("blogPosts");
  if (blogPosts) {
    var postEls = Array.prototype.slice.call(blogPosts.querySelectorAll(".post"));
    var blogSearch = document.getElementById("blogSearch");
    var blogFilters = document.getElementById("blogFilters");
    var blogEmpty = document.getElementById("blogEmpty");
    var curCat = "all";

    function applyBlog() {
      var q = (blogSearch ? blogSearch.value : "").trim().toLowerCase();
      var shown = 0;
      postEls.forEach(function (p) {
        var okCat = curCat === "all" || p.dataset.cat === curCat;
        var hay = (p.dataset.title || "") + " " + (p.dataset.tags || "");
        var okQ = !q || hay.toLowerCase().indexOf(q) > -1;
        var show = okCat && okQ;
        p.classList.toggle("hide", !show);
        if (show) shown++;
      });
      if (blogEmpty) blogEmpty.hidden = shown !== 0;
    }

    function setCat(cat) {
      curCat = cat;
      if (blogFilters) {
        var active = blogFilters.querySelector(".is-active");
        var btn = blogFilters.querySelector('[data-filter="' + cat + '"]');
        if (btn && active) { active.classList.remove("is-active"); btn.classList.add("is-active"); }
      }
      applyBlog();
    }

    if (blogSearch) blogSearch.addEventListener("input", applyBlog);
    if (blogFilters) blogFilters.addEventListener("click", function (e) {
      var b = e.target.closest(".filter");
      if (b) setCat(b.dataset.filter);
    });
    document.querySelectorAll("[data-cat-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setCat(a.dataset.catLink);
        blogPosts.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---- Share buttons ---- */
  var shareBar = document.getElementById("shareBar");
  if (shareBar) {
    var sUrl = encodeURIComponent(location.href);
    var sTitle = encodeURIComponent(document.title);
    var shareMap = {
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + sUrl,
      twitter: "https://twitter.com/intent/tweet?url=" + sUrl + "&text=" + sTitle,
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + sUrl,
      whatsapp: "https://wa.me/?text=" + sTitle + "%20" + sUrl
    };
    shareBar.querySelectorAll("[data-share]").forEach(function (a) {
      a.href = shareMap[a.dataset.share] || "#";
    });
    var copyBtn = document.getElementById("copyLink");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var flash = function () { copyBtn.classList.add("copied"); setTimeout(function () { copyBtn.classList.remove("copied"); }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(flash, flash);
      else flash();
    });
  }

  /* ---- Comments: form + reply ---- */
  var commentForm = document.getElementById("commentForm");
  if (commentForm) {
    var cList = document.getElementById("commentList");
    var cCount = document.getElementById("commentCount");
    var cNote = document.getElementById("cNote");

    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cName");
      var email = document.getElementById("cEmail");
      var msg = document.getElementById("cMessage");
      var ok = true;
      [name, msg].forEach(function (f) {
        var v = f.value.trim() !== "";
        f.parentElement.classList.toggle("error", !v);
        if (!v) ok = false;
      });
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
      email.parentElement.classList.toggle("error", !emailOk);
      if (!emailOk) ok = false;
      if (!ok) { cNote.textContent = "Please fill in all fields correctly."; cNote.className = "form-note err"; return; }

      var li = document.createElement("li");
      li.className = "comment";
      li.innerHTML =
        '<div class="comment-card"><div class="comment-head">' +
        '<img class="avatar" src="assets/images/avatar-2.jpg" alt="" />' +
        '<div class="comment-id"><strong></strong><span class="comment-date">Just now</span></div>' +
        '<button type="button" class="comment-reply">↩ Reply</button></div><p></p></div>';
      li.querySelector("strong").textContent = name.value.trim();
      li.querySelector("p").textContent = msg.value.trim();
      cList.appendChild(li);
      cCount.textContent = (parseInt(cCount.textContent, 10) || 0) + 1;

      commentForm.reset();
      cNote.textContent = "Thanks! Your comment has been posted."; cNote.className = "form-note ok";
    });

    cList.addEventListener("click", function (e) {
      var btn = e.target.closest(".comment-reply");
      if (!btn) return;
      var who = btn.closest(".comment-card").querySelector("strong").textContent.trim();
      cNote.textContent = "Replying to " + who;
      cNote.className = "form-note";
      document.getElementById("cMessage").focus();
      commentForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---- Scrollspy: active nav link ---- */
  var spyLinks = document.querySelectorAll('.nav .nav-link[href^="#"]');
  if (spyLinks.length) {
    var linkFor = {};
    spyLinks.forEach(function (l) { var id = l.getAttribute("href").slice(1); if (id) linkFor[id] = l; });
    var spySections = Object.keys(linkFor).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (spySections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            spyLinks.forEach(function (l) { l.classList.remove("active"); });
            if (linkFor[en.target.id]) linkFor[en.target.id].classList.add("active");
          }
        });
      }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
      spySections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---- Countdown (coming-soon page) ---- */
  var cd = document.getElementById("countdown");
  if (cd) {
    var target = new Date(cd.dataset.date || "2026-12-31T00:00:00").getTime();
    var elD = document.getElementById("cd-d"), elH = document.getElementById("cd-h"),
        elM = document.getElementById("cd-m"), elS = document.getElementById("cd-s");
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      if (elD) elD.textContent = Math.floor(diff / 86400000);
      if (elH) elH.textContent = pad(Math.floor(diff / 3600000) % 24);
      if (elM) elM.textContent = pad(Math.floor(diff / 60000) % 60);
      if (elS) elS.textContent = pad(Math.floor(diff / 1000) % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---- Notify form (coming-soon page) ---- */
  var notify = document.getElementById("notifyForm");
  if (notify) {
    notify.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("notifyEmail");
      var nnote = document.getElementById("notifyNote");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        nnote.textContent = "Please enter a valid email address."; nnote.className = "notify-note err"; return;
      }
      nnote.textContent = "Thanks! We'll let you know when we launch."; nnote.className = "notify-note ok";
      notify.reset();
    });
  }

  /* ---- Style switcher (accent color) ---- */
  var ss = document.getElementById("styleSwitcher");
  if (ss) {
    var ssToggle = document.getElementById("ssToggle");
    var swatches = ss.querySelectorAll(".ss-swatch");
    var current = document.documentElement.getAttribute("data-accent") || "lime";
    swatches.forEach(function (s) { s.classList.toggle("active", s.dataset.accent === current); });

    ssToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = ss.classList.toggle("open");
      ssToggle.setAttribute("aria-expanded", open);
    });
    swatches.forEach(function (s) {
      s.addEventListener("click", function () {
        var a = s.dataset.accent;
        if (a && a !== "lime") document.documentElement.setAttribute("data-accent", a);
        else document.documentElement.removeAttribute("data-accent");
        swatches.forEach(function (x) { x.classList.toggle("active", x === s); });
        try { localStorage.setItem("accent", a); } catch (err) {}
      });
    });
    document.addEventListener("click", function (e) {
      if (ss.classList.contains("open") && !ss.contains(e.target)) {
        ss.classList.remove("open"); ssToggle.setAttribute("aria-expanded", "false");
      }
    });

    // direction (LTR / RTL)
    var dirBtns = ss.querySelectorAll(".ss-dir");
    var curDir = document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
    dirBtns.forEach(function (b) { b.classList.toggle("active", b.dataset.dir === curDir); });
    dirBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.dataset.dir;
        if (d === "rtl") document.documentElement.setAttribute("dir", "rtl");
        else document.documentElement.removeAttribute("dir");
        dirBtns.forEach(function (x) { x.classList.toggle("active", x === b); });
        try { localStorage.setItem("dir", d); } catch (err) {}
      });
    });
  }

  /* ---- Footer year ---- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
