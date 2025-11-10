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
  const otpStep = document.getElementById("otp-step");
  const otpEmail = document.getElementById("otp-email");
  const otpInput = document.getElementById("otp-code");
  const otpStatus = document.getElementById("otp-status");
  const verifyOtpButton = document.getElementById("verify-otp-button");
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

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
    resetReviewFlow();
    modal.style.display = "block";
    overlay.style.display = "block";
  }
  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    overlay.style.display = "none";
    resetReviewFlow();
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);
  if (verifyMsgClose) verifyMsgClose.addEventListener("click", () => {
    verifyMsg.style.display = "none";
  });

  let pendingReviewId = null;
  let pendingEmail = "";
  let attemptsLeft = null;

  function resetReviewFlow() {
    pendingReviewId = null;
    pendingEmail = "";
    attemptsLeft = null;

    if (form) {
      form.reset();
      hiddenRating && (hiddenRating.value = "0");
      if (starsWrapper) {
        [...starsWrapper.querySelectorAll("i")].forEach((el) => {
          el.classList.remove("fa-solid");
          el.classList.add("fa-regular");
        });
      }
      Array.from(form.elements).forEach((field) => {
        if (field && "disabled" in field) {
          field.disabled = false;
        }
        if (field && "readOnly" in field) {
          field.readOnly = false;
        }
      });
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.style.display = "";
    }
    if (statusBox) {
      statusBox.textContent = "";
      statusBox.style.display = "none";
    }
    if (otpStep) {
      otpStep.style.display = "none";
    }
    if (otpStatus) {
      otpStatus.textContent = "";
      otpStatus.style.display = "none";
    }
    if (otpInput) {
      otpInput.value = "";
    }
    if (otpEmail) {
      otpEmail.textContent = "";
    }
    if (verifyOtpButton) {
      verifyOtpButton.disabled = false;
    }
  }

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
          pendingReviewId = data.reviewId;
          pendingEmail = email.trim().toLowerCase();
          attemptsLeft = data.maxAttempts ?? 3;

          if (submitButton) {
            submitButton.disabled = true;
            submitButton.style.display = "none";
          }

          Array.from(form.elements).forEach((field) => {
            if (!field) return;
            if (field.id === "otp-code" || field.id === "verify-otp-button") return;
            if (field.type === "checkbox") {
              field.disabled = true;
            } else if ("readOnly" in field) {
              field.readOnly = true;
            }
          });

          if (otpEmail) otpEmail.textContent = pendingEmail;
          if (otpStep) otpStep.style.display = "block";

          statusBox.style.color = "#0f5132";
          statusBox.textContent = "We sent a verification code to your email.";

          if (otpStatus) {
            otpStatus.style.display = "none";
            otpStatus.textContent = "";
          }
          if (otpInput) otpInput.focus();
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

  async function verifyOtp() {
    if (!pendingReviewId) {
      return;
    }

    const otp = otpInput?.value.trim();
    if (!otp || otp.length !== 6) {
      if (otpStatus) {
        otpStatus.style.display = "block";
        otpStatus.style.color = "#b00020";
        otpStatus.textContent = "Enter the 6-digit code from your email.";
      }
      return;
    }

    try {
      if (otpStatus) {
        otpStatus.style.display = "block";
        otpStatus.style.color = "#333";
        otpStatus.textContent = "Verifying...";
      }

      const response = await fetch("/api/reviews/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: pendingReviewId, otp }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        resetReviewFlow();
        closeModal();
        verifyMsg.style.display = "block";
        loadVerifiedReviews();
        return;
      }

      attemptsLeft = typeof result.attemptsLeft === "number" ? result.attemptsLeft : (attemptsLeft != null ? attemptsLeft - 1 : null);

      if (otpStatus) {
        otpStatus.style.display = "block";
        otpStatus.style.color = "#b00020";
        otpStatus.textContent =
          result.message ||
          "Unable to verify the code. Please try again.";

        if (attemptsLeft != null && attemptsLeft >= 0) {
          otpStatus.textContent += ` (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left)`;
        }
      }

      if (attemptsLeft !== null && attemptsLeft <= 0) {
        if (verifyOtpButton) verifyOtpButton.disabled = true;
        if (otpStatus) {
          otpStatus.textContent += " Please submit the review again to request a new code.";
        }
      }
    } catch (error) {
      console.error("verifyOtp error:", error);
      if (otpStatus) {
        otpStatus.style.display = "block";
        otpStatus.style.color = "#b00020";
        otpStatus.textContent = "Network error. Please try again.";
      }
    }
  }

  if (verifyOtpButton) {
    verifyOtpButton.addEventListener("click", verifyOtp);
  }
  if (otpInput) {
    otpInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        verifyOtp();
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
