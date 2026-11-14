/**
 * Wood Works Studio – Direct Lead System
 * ------------------------------------------------------------
 * - Floating WhatsApp button (all pages)
 * - Sticky "Call / WhatsApp" bar on mobile (all pages)
 * - Quick enquiry form that goes straight to the owner on WhatsApp,
 *   with an email copy sent in the background (no Zoho needed)
 * - Conversion tracking for every call / WhatsApp / form lead
 *
 * Edit the CONFIG block below to change numbers or keys.
 */
(function () {
  "use strict";

  const CONFIG = {
    // Owner number that receives WhatsApp enquiries (country code, no + or spaces)
    whatsappNumber: "919769384741",
    // Numbers shown on call buttons
    phones: ["+919769384741", "+919769087260"],
    email: "info@woodworksstudio.in",

    // Email copy of every enquiry, without any server.
    // Get a free key at https://web3forms.com using info@woodworksstudio.in
    // and paste it here. Leave empty to skip the email copy.
    web3formsKey: "",

    // Google Ads conversion label (Google Ads > Goals > Conversions).
    // Format: "AW-17811213223/XXXXXXXXXXXX". Leave empty until created.
    adsConversion: "",

    defaultMessage:
      "Hi Wood Works Studio, I saw your website and would like a free design estimate.",
  };

  // ---------- Tracking ----------
  function track(action, label) {
    try {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", action, {
        event_category: "lead",
        event_label: label || "",
      });
      if (CONFIG.adsConversion) {
        window.gtag("event", "conversion", { send_to: CONFIG.adsConversion });
      }
    } catch (e) {
      /* never break the page for analytics */
    }
  }

  function waLink(text) {
    return (
      "https://wa.me/" +
      CONFIG.whatsappNumber +
      "?text=" +
      encodeURIComponent(text || CONFIG.defaultMessage)
    );
  }

  const WA_ICON =
    '<svg viewBox="0 0 32 32" aria-hidden="true" width="28" height="28"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.56 4.2 1.62 6.03L4 29l8.13-1.6a12 12 0 0 0 3.9.65h.01C22.68 28.05 28 22.65 28 16.01 28 9.38 22.68 3 16.04 3Zm0 22.9c-1.2 0-2.38-.2-3.5-.6l-.25-.09-4.82.95.98-4.7-.16-.26A9.86 9.86 0 0 1 6.1 15.04c0-5.48 4.46-9.94 9.95-9.94 5.48 0 9.84 4.46 9.84 9.94 0 5.49-4.37 10.86-9.85 10.86Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>';

  // ---------- Floating WhatsApp (injected on every page, phones included) ----------
  function injectFloatingContacts() {
    if (document.querySelector(".wws-wa-float")) return;

    const float = document.createElement("a");
    float.className = "wws-wa-float";
    float.href = waLink();
    float.target = "_blank";
    float.rel = "noopener";
    float.setAttribute("aria-label", "Chat with us on WhatsApp");
    float.innerHTML =
      WA_ICON + '<span class="wws-wa-tip">Chat with us — we reply fast</span>';
    float.addEventListener("click", () => track("whatsapp_click", "floating"));
    document.body.appendChild(float);

  }

  // Track any tel:/wa.me/mailto link already in the page
  function trackExistingLinks() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.closest(".wws-mobile-bar") || a.classList.contains("wws-wa-float")) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) track("call_click", a.dataset.track || "link");
      else if (href.includes("wa.me/")) track("whatsapp_click", a.dataset.track || "link");
      else if (href.startsWith("mailto:")) track("email_click", a.dataset.track || "link");
    });
  }

  // ---------- Quick enquiry form ----------
  function sendEmailCopy(lead) {
    const subject = "New website enquiry: " + lead.service + " – " + lead.name;
    const body =
      "Name: " + lead.name + "\nPhone: " + lead.phone + "\nArea: " + lead.area +
      "\nService: " + lead.service + "\nBudget: " + lead.budget +
      "\nMessage: " + (lead.message || "-") + "\nPage: " + location.href;

    try {
      if (CONFIG.web3formsKey) {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: CONFIG.web3formsKey,
            subject: subject,
            from_name: "Wood Works Studio Website",
            name: lead.name,
            phone: lead.phone,
            area: lead.area,
            service: lead.service,
            budget: lead.budget,
            message: lead.message || "-",
            page: location.href,
          }),
        }).catch(() => {});
      } else {
        // Fall back to the existing server endpoint if it is deployed
        fetch("/api/send-contact-email", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: lead.name,
            email: CONFIG.email,
            phone: lead.phone,
            subject: subject,
            message: body,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      /* WhatsApp is the primary channel; ignore email failures */
    }
  }

  function buildWhatsAppText(lead) {
    const lines = [
      "Hi Wood Works Studio, I'd like a free design estimate.",
      "",
      "Name: " + lead.name,
      "Phone: " + lead.phone,
      "Looking for: " + lead.service,
    ];
    if (lead.area && lead.area !== "-") lines.push("Area: " + lead.area);
    if (lead.budget && lead.budget !== "Not sure yet") lines.push("Budget: " + lead.budget);
    if (lead.message) lines.push("Details: " + lead.message);
    return lines.join("\n");
  }

  function setupLeadForm() {
    const form = document.getElementById("lead-form");
    if (!form) return;
    const errorEl = form.querySelector(".lead-error");
    const success = document.getElementById("lead-success");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const lead = {
        name: (fd.get("name") || "").trim(),
        phone: (fd.get("phone") || "").replace(/[^\d+]/g, ""),
        area: (fd.get("area") || "").trim() || "-",
        service: fd.get("service") || "-",
        budget: fd.get("budget") || "Not sure yet",
        message: (fd.get("message") || "").trim(),
      };

      const digits = lead.phone.replace(/\D/g, "");
      if (lead.name.length < 2) return showError("Please enter your name.");
      if (digits.length < 10 || digits.length > 13)
        return showError("Please enter a valid 10-digit mobile number.");
      if (lead.service === "-") return showError("Please choose what you're looking for.");
      showError("");

      // Open WhatsApp synchronously (inside the click) so it's never popup-blocked
      const url = waLink(buildWhatsAppText(lead));
      let win = null;
      try {
        win = window.open(url, "_blank");
      } catch (err) {
        win = null;
      }
      if (win) win.opener = null;
      // If the popup was blocked, never navigate an embedded frame
      // (WhatsApp refuses to load inside one). The success panel below
      // shows a big "Open WhatsApp" button instead.
      const framed = (() => {
        try { return window.top !== window.self; } catch (err) { return true; }
      })();
      if (!win && !framed) window.location.href = url;

      sendEmailCopy(lead);
      track("generate_lead", "enquiry_form:" + lead.service);

      if (success) {
        success.querySelector(".lead-success-name").textContent = lead.name.split(" ")[0];
        const waBtn = success.querySelector(".lead-success-wa");
        const msg = success.querySelector(".lead-success-msg");
        waBtn.href = url;
        if (win) {
          if (msg) msg.innerHTML = "WhatsApp has opened with your details filled in. Just tap <strong>Send</strong> and our team will get back to you shortly.";
          (waBtn.querySelector(".lead-label") || waBtn).textContent = "Didn't open? Tap here";
        } else {
          if (msg) msg.innerHTML = "One last step: tap the button below to send your enquiry to us on WhatsApp. Your details are already filled in.";
          (waBtn.querySelector(".lead-label") || waBtn).textContent = "Open WhatsApp to send";
        }
        form.hidden = true;
        success.hidden = false;
      }
      form.reset();
    });

    function showError(msg) {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.hidden = !msg;
      }
    }

    const again = document.getElementById("lead-again");
    if (again)
      again.addEventListener("click", () => {
        success.hidden = true;
        form.hidden = false;
      });
  }

  // the footer has its own WhatsApp buttons: fade the floating bubble there
  function hideFloatOverFooter() {
    const f = document.querySelector(".wf");
    if (!f) return;
    if (!("IntersectionObserver" in window)) { f.classList.add("is-live"); return; }
    new IntersectionObserver(([e]) => {
      document.body.classList.toggle("wws-footer-in-view", e.intersectionRatio > 0.15);
      f.classList.toggle("is-live", e.isIntersecting); // marquee only runs on screen
    }, { threshold: [0, 0.15] }).observe(f);

    // footer mini form: number -> WhatsApp enquiry to the owner
    const form = f.querySelector("[data-wf-form]");
    const msg = f.querySelector(".wf-msg");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = (form.phone.value || "").replace(/[^\d+]/g, "");
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) {
        msg.textContent = "Please enter a valid 10-digit mobile number.";
        form.phone.focus();
        return;
      }
      const url = waLink("Hi Wood Works Studio, I'd like a free design estimate. Please call or WhatsApp me on " + phone + ".");
      let win = null;
      try { win = window.open(url, "_blank"); } catch (err) {}
      if (win) win.opener = null; else window.location.href = url;
      track("generate_lead", "footer_form");
      msg.textContent = "WhatsApp is opening with your number filled in. Just tap Send.";
      form.reset();
    });
  }

  // Footer: the giant "Wood Works Studio" fills exactly the height that is
  // left once the closing line, columns and last line are laid out
  function fitFooterName() {
    const f = document.querySelector(".wf");
    const m = f && f.querySelector(".wf-marquee");
    if (!m) return;
    const fit = () => {
      const cs = getComputedStyle(f);
      let used = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 72; // breathing room above the name
      [...f.children].forEach((c) => {
        if (c === m || c.classList.contains("wh-sr")) return;
        const ccs = getComputedStyle(c);
        used += c.offsetHeight + parseFloat(ccs.marginTop) + parseFloat(ccs.marginBottom);
      });
      f.style.setProperty("--wf-rest", Math.round(used) + "px");
    };
    fit();
    let t = 0;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 120); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  function init() {
    hideFloatOverFooter();
    fitFooterName();
    injectFloatingContacts();
    trackExistingLinks();
    setupLeadForm();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.WWS_LEADS = { CONFIG, track, waLink };
})();
