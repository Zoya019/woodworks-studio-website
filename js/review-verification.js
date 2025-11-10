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

  // ⭐ STAR RATING
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
        if (r <= val) {
          el.classList.remove("fa-regular");
          el.classList.add("fa-solid");
        } else {
          el.classList.remove("fa-solid");
          el.classList.add("fa-regular");
        }
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

  // ✅ SUBMIT REVIEW
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusBox.style.display = "block";
      statusBox.style.color = "#333";
      statusBox.textContent = "Submitting...";

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const rating = document.getElementById("rating").value;
      const review = document.getElementById("review").value.trim();
      const consent = document.getElementById("consent").checked;

      if (!name || !email || !rating) {
        statusBox.style.color = "#b00020";
        return statusBox.textContent = "Please fill all required fields.";
      }
      if (!consent) {
        statusBox.style.color = "#b00020";
        return statusBox.textContent = "Please accept terms.";
      }

      // ✅ Debug log
      console.log("✅ Sending Review:", { name, email, rating, review, consent });

      try {
        const response = await fetch("/api/reviews/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, rating, review, consent }),
        });

        const data = await response.json();
        console.log("📩 Server Response:", data);

        if (data.ok) {
          form.reset();
          hiddenRating.value = "0";
          [...starsWrapper.querySelectorAll("i")].forEach((el) => {
            el.classList.remove("fa-solid");
            el.classList.add("fa-regular");
          });

          closeModal();
          verifyMsg.style.display = "block";
          statusBox.style.display = "none";
        } else {
          statusBox.style.color = "#b00020";
          statusBox.textContent = data.message || "Failed to submit.";
        }
      } catch (err) {
        console.error("🔥 Network or server error:", err);
        statusBox.style.color = "#b00020";
        statusBox.textContent = "Network error. Try again.";
      }
    });
  }

  // ✅ LOAD VERIFIED REVIEWS
  async function loadVerifiedReviews() {
    if (!reviewsContainer) return;
    try {
      const resp = await fetch("/api/reviews/list?limit=20");
      const json = await resp.json();
      if (!json.ok) return;

      if (!json.items.length) {
        reviewsContainer.innerHTML = `<p>No reviews yet — be the first!</p>`;
        return;
      }

      reviewsContainer.innerHTML = json.items
        .map((r) => renderReviewCard(r))
        .join("");
    } catch (e) {
      console.error("loadVerifiedReviews error:", e);
    }
  }

  function renderReviewCard(r) {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    return `
      <div class="review-card">
        <div class="review-header">
          <span class="review-name">⭐ ${r.rating}/5 — ${escapeHTML(r.name)}</span>
        </div>
        <div class="review-text">${escapeHTML(r.review || "")}</div>
      </div>
    `;
  }

  function escapeHTML(s = "") {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[c]));
  }

  window.reviewVerification = { loadVerifiedReviews };

})();
