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

    reviewDiv.innerHTML = `
        <p><strong>${review.name}</strong> (${review.rating} ⭐)</p>
        <p>${review.reviewText}</p>
    `;

    container.appendChild(reviewDiv);
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
            // Optional redirect after 3s
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

// Make functions globally accessible
window.reviewVerification = {
    submitReview,
    verifyReview,
    addVerifiedReviewToPage,
    loadVerifiedReviews,
    generateToken
};
