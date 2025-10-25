/** 
 * Review Verification System
 * Handles submission, verification, and rendering of reviews
 */

// Helpers for localStorage persistence
function getList(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
        return [];
    }
}

function setList(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

// Reusable small modal
function showMiniModal({ title = '', message = '', showInput = false, defaultValue = '', placeholder = '', confirmText = 'OK', cancelText = 'Cancel' }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'mini-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'mini-modal';

        const header = document.createElement('div');
        header.className = 'mini-modal-header';
        header.textContent = title;

        const body = document.createElement('div');
        body.className = 'mini-modal-body';
        if (message) {
            const p = document.createElement('p');
            p.textContent = message;
            body.appendChild(p);
        }

        let inputEl = null;
        if (showInput) {
            inputEl = document.createElement('textarea');
            inputEl.className = 'mini-modal-input';
            inputEl.placeholder = placeholder || '';
            inputEl.value = defaultValue || '';
            body.appendChild(inputEl);
        }

        const footer = document.createElement('div');
        footer.className = 'mini-modal-footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'mini-modal-btn secondary';
        cancelBtn.textContent = cancelText;

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'mini-modal-btn primary';
        confirmBtn.textContent = confirmText;

        footer.appendChild(cancelBtn);
        footer.appendChild(confirmBtn);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const cleanup = () => overlay.remove();

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve({ confirmed: false, value: inputEl ? inputEl.value : undefined });
        });
        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve({ confirmed: true, value: inputEl ? inputEl.value : undefined });
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve({ confirmed: false, value: inputEl ? inputEl.value : undefined });
            }
        });
    });
}

// Function to handle review submission
async function submitReview(reviewData) {
    try {
        const response = await fetch('/api/send-review-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });

        const data = await response.json();

        if (data.success) {
            await showMiniModal({
                title: 'Email Sent',
                message: 'Verification email sent! Check your inbox.',
                confirmText: 'OK'
            });

            const pendingReviews = getList('pendingReviews');
            pendingReviews.push({
                ...reviewData,
                status: 'pending',
                verificationToken: data.token,
                submittedAt: new Date().toISOString()
            });
            setList('pendingReviews', pendingReviews);

            return data.token;
        } else {
            await showMiniModal({
                title: 'Error',
                message: 'Failed to send verification email.',
                confirmText: 'OK'
            });
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error sending review:', error);
        await showMiniModal({ title: 'Error', message: 'An error occurred while sending the review.', confirmText: 'OK' });
    }
}

// Function to verify a review
function verifyReview(token) {
    const pendingReviews = getList('pendingReviews');
    const idx = pendingReviews.findIndex(r => r.verificationToken === token);

    if (idx === -1) {
        return { success: false, message: 'Invalid or expired verification token' };
    }

    const verifiedReview = { ...pendingReviews[idx], status: 'verified' };

    // Remove from pending and add to verified
    pendingReviews.splice(idx, 1);
    setList('pendingReviews', pendingReviews);

    const verifiedReviews = getList('verifiedReviews');
    verifiedReviews.push(verifiedReview);
    setList('verifiedReviews', verifiedReviews);

    // Render on page
    addVerifiedReviewToPage(verifiedReview);

    return { success: true, message: 'Review verified successfully' };
}

// Function to add a verified review to the page
function addVerifiedReviewToPage(review) {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    // Hide "no reviews" message if it exists
    const noReviewsMsg = container.querySelector('.no-reviews-message');
    if (noReviewsMsg) noReviewsMsg.style.display = 'none';

    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('review-item');
    reviewDiv.classList.add('review-card');
    // remove inline styles in favor of CSS theme
    reviewDiv.dataset.token = review.verificationToken;

    reviewDiv.innerHTML = `
        <div class="review-header">
            <strong>${review.name} (${review.rating} ⭐)</strong>
            <button class="review-menu-btn" aria-label="Review actions" title="More actions">⋮</button>
        </div>
        <p class="review-text">${review.reviewText}</p>
        <div class="review-footer">
            <span class="edited-label" style="display:${review.edited ? 'inline' : 'none'};">edited</span>
        </div>
    `;

    container.appendChild(reviewDiv);

    // Add menu functionality
    const menuBtn = reviewDiv.querySelector('.review-menu-btn');
    menuBtn.addEventListener('click', () => {
        openReviewMenu(reviewDiv, review);
    });
}

// Load all verified reviews from localStorage
function loadVerifiedReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    const reviews = getList('verifiedReviews');
    const noReviewsMsg = container.querySelector('.no-reviews-message');

    // Clear old reviews
    container.querySelectorAll('.review-item').forEach(el => el.remove());

    if (reviews.length === 0) {
        if (noReviewsMsg) noReviewsMsg.style.display = 'block';
    } else {
        if (noReviewsMsg) noReviewsMsg.style.display = 'none';
        reviews.forEach(addVerifiedReviewToPage);
    }
}

// Helper function to generate a random token
function generateToken() {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
}

// Automatically verify review if token is in URL
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        const result = verifyReview(token);

        const messageDiv = document.getElementById('verification-message');
        if (result.success) {
            if (messageDiv) messageDiv.style.display = 'block';
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } else {
            alert(result.message);
        }
    }

    // Always load verified reviews on page load
    loadVerifiedReviews();
});

// Function to open Edit/Delete menu
function openReviewMenu(reviewDiv, review) {
    const existingMenu = document.querySelector('.review-action-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.classList.add('review-action-menu');
    menu.style.position = 'absolute';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '5px';
    menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    menu.style.padding = '5px 0';
    menu.style.zIndex = 1000;

    menu.innerHTML = `
        <div class="menu-item" style="padding:5px 15px; cursor:pointer;">Edit</div>
        <div class="menu-item" style="padding:5px 15px; cursor:pointer;">Delete</div>
    `;

    document.body.appendChild(menu);

    const rect = reviewDiv.querySelector('.review-menu-btn').getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    // Edit via modal
    menu.querySelector('.menu-item:first-child').addEventListener('click', async () => {
        const result = await showMiniModal({
            title: 'Edit Review',
            message: 'Update your review text below.',
            showInput: true,
            defaultValue: review.reviewText,
            placeholder: 'Enter your updated review...',
            confirmText: 'Save',
            cancelText: 'Cancel'
        });
        if (result.confirmed && result.value && result.value.trim() !== '') {
            const newText = result.value.trim();
            review.reviewText = newText;
            review.edited = true;

            const reviews = getList('verifiedReviews');
            const idx = reviews.findIndex(r => r.verificationToken === review.verificationToken);
            if (idx !== -1) {
                reviews[idx] = review;
                setList('verifiedReviews', reviews);
            }

            reviewDiv.querySelector('.review-text').textContent = newText;
            reviewDiv.querySelector('.edited-label').style.display = 'inline';
        }
        menu.remove();
    });

    // Delete via modal
    menu.querySelector('.menu-item:last-child').addEventListener('click', async () => {
        const result = await showMiniModal({
            title: 'Delete Review',
            message: 'Are you sure you want to delete this review?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (result.confirmed) {
            const reviews = getList('verifiedReviews');
            const updated = reviews.filter(r => r.verificationToken !== review.verificationToken);
            setList('verifiedReviews', updated);
            reviewDiv.remove();

            const container = document.getElementById('reviews-container');
            if (updated.length === 0) {
                const noMsg = container.querySelector('.no-reviews-message');
                if (noMsg) noMsg.style.display = 'block';
            }
        }
        menu.remove();
    });

    document.addEventListener('click', function onDocClick(e) {
        if (!menu.contains(e.target) && e.target !== reviewDiv.querySelector('.review-menu-btn')) {
            menu.remove();
            document.removeEventListener('click', onDocClick);
        }
    });
}

// Make functions globally accessible
window.reviewVerification = {
    submitReview,
    verifyReview,
    addVerifiedReviewToPage,
    loadVerifiedReviews,
    generateToken
};
