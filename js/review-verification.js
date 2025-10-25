/**
 * Review Verification System
 * Persists pending/verified reviews in localStorage and renders verified ones
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
function submitReview(reviewData) {
    // Generate a unique verification token
    const verificationToken = generateToken();

    // Store review with pending status
    const pendingReview = {
        ...reviewData,
        status: 'pending',
        verificationToken,
        submittedAt: new Date().toISOString()
    };

    const pendingReviews = getList('pendingReviews');
    pendingReviews.push(pendingReview);
    setList('pendingReviews', pendingReviews);

    // In a real implementation, this would send an email with the verification link
    const verificationUrl = `${window.location.origin}/verify-review.html?token=${verificationToken}`;
    console.log('Verification URL:', verificationUrl);

    return verificationToken;
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

    // Render on page if container exists (index.html)
    addVerifiedReviewToPage(verifiedReview);

    return { success: true, message: 'Review verified successfully' };
}

// Function to add a verified review to the page
function addVerifiedReviewToPage(review) {
    const reviewsContainer = document.getElementById('reviews-container');
    const noReviewsMessage = document.querySelector('.no-reviews-message');

    if (!reviewsContainer) return;

    // Hide the "no reviews" message if it exists
    if (noReviewsMessage) {
        noReviewsMessage.style.display = 'none';
    }

    // Create a new review card
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';

    // Format the date
    const reviewDate = new Date(review.submittedAt);
    const formattedDate = reviewDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create star rating HTML
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += i <= Number(review.rating)
            ? '<i class="fa-solid fa-star"></i>'
            : '<i class="fa-regular fa-star"></i>';
    }

    // Set the review card content
    reviewCard.innerHTML = `
        <div class="reviewer-info">
            <h4>${review.name}</h4>
            <p class="review-date">${formattedDate}</p>
            <div class="rating">${starsHtml}</div>
        </div>
        <p class="review-text">"${review.reviewText}"</p>
    `;

    // Add the review card to the container
    reviewsContainer.appendChild(reviewCard);
}

// Load all verified reviews from storage
function loadVerifiedReviews() {
    const verifiedReviews = getList('verifiedReviews');
    verifiedReviews.forEach(addVerifiedReviewToPage);
}

// Helper function to generate a random token
function generateToken() {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
}

// Export functions for use in other files
window.reviewVerification = {
    submitReview,
    verifyReview,
    addVerifiedReviewToPage,
    loadVerifiedReviews
};