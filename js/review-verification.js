(function () {
  const modal = document.getElementById("review-modal");
  const overlay = document.getElementById("overlay");
  const openBtn = document.getElementById("open-review-btn");
  const closeBtn = modal ? modal.querySelector(".modal-close") : null;
  const form = document.getElementById("review-form");
  const statusBox = document.getElementById("review-status");
  const verifyMsg = document.getElementById("verification-message");
  const verifyMsgClose = document.getElementById("close-verification");
  const reviewsContainer = document.getElementById("reviews-container");

  // Stars
  const starsWrapper = document.querySelector(".star-rating");
  const hiddenRating = document.getElementById("rating");
  if (starsWrapper && hiddenRating) {
    starsWrapper.addEventListener("click", (e) => {
      const star = e.target.closest("i[data-rating]");
      if (!star) return;
      const val = Number(star.dataset.rating);
      hiddenRating.value = String(val);
      [...starsWrapper.querySelectorAll("i")].forEach((el) => {
        const r = Number(el.dataset.rating);
        el.classList.toggle("fa-solid", r <= val);
        el.classList.toggle("fa-regular", r > val);
      });
    });
  }

  function openModal() {
    if (!modal) return;
    modal.style.display = "block";
    overlay.style.display = "block";
  }
  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    overlay.style.display = "none";
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);
  if (verifyMsgClose) verifyMsgClose.addEventListener("click", () => {
    verifyMsg.style.display = "none";
  });

  // Submit review
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusBox.style.display = "none";

      const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        rating: document.getElementById("rating").value,
        review: document.getElementById("review").value.trim(),
        consent: document.getElementById("consent").checked,
      };

      if (!data.consent) return showStatus("Please accept the guidelines.", false);
      if (!data.rating || Number(data.rating) < 1) return showStatus("Please select a star rating.", false);

      try {
        showStatus("Submitting...", true);
        const resp = await fetch("/api/reviews/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await resp.json();
        if (json.ok) {
          form.reset();
          hiddenRating.value = "0";
          [...starsWrapper.querySelectorAll("i")].forEach((el) => {
            el.classList.add("fa-regular");
            el.classList.remove("fa-solid");
          });
          closeModal();
          if (verifyMsg) verifyMsg.style.display = "block";
        } else {
          showStatus(json.message || "Failed to submit.", false);
        }
      } catch (err) {
        console.error(err);
        showStatus("Network error. Please try again.", false);
      }
    });
  }

  function showStatus(msg, neutral) {
    if (!statusBox) return;
    statusBox.textContent = msg;
    statusBox.style.display = "block";
    statusBox.style.color = neutral ? "#333" : "#b00020";
  }

  // Load verified reviews
  async function loadVerifiedReviews() {
    if (!reviewsContainer) return;
    try {
      const resp = await fetch("/api/reviews/list?limit=20");
      const { ok, items } = await resp.json();
      if (!ok) return;
      reviewsContainer.innerHTML = items.map(renderReviewCard).join("");
    } catch (e) {
      console.error("loadVerifiedReviews", e);
    }
  }

  function renderReviewCard(r) {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    const text = r.review ? `<p class="review-text">${escapeHTML(r.review)}</p>` : "";
    return `
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-name">${escapeHTML(r.name)}</div>
          <div class="review-stars" aria-label="${r.rating} out of 5">${stars}</div>
        </div>
        ${text}
      </div>
    `;
  }

  function escapeHTML(s = "") {
    return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  }

  // expose for index.html inline call
  window.reviewVerification = { loadVerifiedReviews };

  // Auto-verify on verify-review.html
  (async function maybeVerifyPage() {
    if (!/verify-review\.html$/i.test(location.pathname)) return;
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const msgEl = document.getElementById("verify-result");
    if (!msgEl) return;
    if (!token) return (msgEl.textContent = "Invalid verification link.");

    try {
      msgEl.textContent = "Verifying...";
      const resp = await fetch(`/api/reviews/verify?token=${encodeURIComponent(token)}`);
      const json = await resp.json();
      msgEl.textContent = json.ok ? "Email verified! Your review is now published." : (json.message || "Verification failed.");
    } catch (e) {
      msgEl.textContent = "Network error. Please try again.";
    }
  })();
})();
