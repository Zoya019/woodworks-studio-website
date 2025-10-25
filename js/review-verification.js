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
            alert('Verification email sent! Check your inbox.');

            // Store pending review locally with token
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
            alert('Failed to send verification email.');
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error sending review:', error);
        alert('An error occurred while sending the review.');
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
    reviewDiv.style.border = '1px solid #ccc';
    reviewDiv.style.padding = '15px';
    reviewDiv.style.margin = '10px 0';
    reviewDiv.style.borderRadius = '5px';
    reviewDiv.dataset.token = review.verificationToken;

    reviewDiv.innerHTML = `
        <div class="review-header" style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${review.name} (${review.rating} ⭐)</strong>
            <div class="review-menu" style="cursor:pointer; font-weight:bold;">&#x22EE;</div>
        </div>
        <p class="review-text">${review.reviewText}</p>
        <div class="review-footer">
            <span class="edited-label" style="display:${review.edited ? 'inline' : 'none'}; font-size:12px; color:#777;">edited</span>
        </div>
    `;

    container.appendChild(reviewDiv);

    // Add menu functionality
    const menuBtn = reviewDiv.querySelector('.review-menu');
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
    // Remove any existing menu
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

    // Position menu near the button
    const rect = reviewDiv.querySelector('.review-menu').getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    // Edit
    menu.querySelector('.menu-item:first-child').addEventListener('click', () => {
        const newText = prompt('Edit your review:', review.reviewText);
        if (newText !== null && newText.trim() !== '') {
            review.reviewText = newText;
            review.edited = true;

            // Update localStorage
            const reviews = getList('verifiedReviews');
            const idx = reviews.findIndex(r => r.verificationToken === review.verificationToken);
            if (idx !== -1) {
                reviews[idx] = review;
                setList('verifiedReviews', reviews);
            }

            // Update DOM
            reviewDiv.querySelector('.review-text').textContent = newText;
            reviewDiv.querySelector('.edited-label').style.display = 'inline';
        }
        menu.remove();
    });

    // Delete
    menu.querySelector('.menu-item:last-child').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this review?')) {
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

    // Close menu if clicking outside
    document.addEventListener('click', function onDocClick(e) {
        if (!menu.contains(e.target) && e.target !== reviewDiv.querySelector('.review-menu')) {
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
