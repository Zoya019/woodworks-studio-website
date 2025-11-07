document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year automatically
    const footerYearElements = document.querySelectorAll('.footer-year');
    const currentYear = new Date().getFullYear();
    
    footerYearElements.forEach(element => {
        element.textContent = currentYear;
    });
    
    // Review System Implementation
    const reviewForm = document.getElementById('review-form');
    const reviewsContainer = document.getElementById('reviews-container');
    const noReviewsMessage = document.querySelector('.no-reviews-message');
    const verificationMessage = document.getElementById('verification-message');
    const closeVerificationBtn = document.getElementById('close-verification');
    const reviewStatusMessage = document.getElementById('review-status');
    const overlay = document.getElementById('overlay');
    const reviewModal = document.getElementById('review-modal');
    const openReviewBtn = document.getElementById('open-review-btn');
    const modalClose = document.querySelector('.modal-close');
    
    // Show no reviews message if no reviews exist
    if (reviewsContainer && noReviewsMessage) {
        noReviewsMessage.style.display = 'block';
    }
    
    // Open review modal
    if (openReviewBtn) {
        openReviewBtn.addEventListener('click', function() {
            reviewModal.style.display = 'block';
            overlay.style.display = 'block';
        });
    }
    
    // Close review modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            reviewModal.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === overlay) {
            reviewModal.style.display = 'none';
            verificationMessage.style.display = 'none';
            overlay.style.display = 'none';
        }
    });
    
    
    // Content moderation function
    function moderateContent(text) {
        // Simple content moderation - check for offensive words
        const offensiveWords = [
            'offensive', 'inappropriate', 'explicit', 'obscene', 'profanity',
            'hate', 'vulgar', 'racist', 'sexist', 'violent'
            // Add more words as needed
        ];
        
        const lowerText = text.toLowerCase();
        for (const word of offensiveWords) {
            if (lowerText.includes(word)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Handle review form submission (direct to backend, no verification)
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const rating = document.getElementById('rating').value;
            const reviewText = document.getElementById('review').value;
            const consent = document.getElementById('consent').checked;

            // Basic validation
            if (!name || rating === '0' || !reviewText || !consent) {
                reviewStatusMessage.textContent = 'Please fill in all fields and provide a rating.';
                reviewStatusMessage.style.display = 'block';
                reviewStatusMessage.style.color = 'red';
                return;
            }

            // Content moderation check
            if (!moderateContent(reviewText)) {
                reviewStatusMessage.textContent = 'Your review contains inappropriate content. Please revise.';
                reviewStatusMessage.style.display = 'block';
                reviewStatusMessage.style.color = 'red';
                return;
            }

            // Prepare review data
            const reviewData = {
                name,
                rating,
                reviewText
            };

            // Submit review directly to backend
            try {
                const response = await fetch('/api/reviews/submit-review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                });
                if (response.ok) {
                    // Hide review form and show thank you message
                    reviewModal.style.display = 'none';
                    overlay.style.display = 'none';
                    reviewStatusMessage.textContent = 'Thank you for your review!';
                    reviewStatusMessage.style.display = 'block';
                    reviewStatusMessage.style.color = 'green';
                    // Reset form
                    reviewForm.reset();
                    stars.forEach(s => {
                        s.classList.remove('fa-solid');
                        s.classList.add('fa-regular');
                    });
                    ratingInput.value = '0';
                    // Reload reviews instantly
                    loadReviews();
                } else {
                    reviewStatusMessage.textContent = 'Failed to submit review. Please try again.';
                    reviewStatusMessage.style.display = 'block';
                    reviewStatusMessage.style.color = 'red';
                }
            } catch (err) {
                reviewStatusMessage.textContent = 'Error submitting review. Please try again.';
                reviewStatusMessage.style.display = 'block';
                reviewStatusMessage.style.color = 'red';
            }
        });
    }
    
    // Close verification message
    if (closeVerificationBtn) {
        closeVerificationBtn.addEventListener('click', function() {
            verificationMessage.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close verification message
    if (closeVerificationBtn) {
        closeVerificationBtn.addEventListener('click', function() {
            verificationMessage.style.display = 'none';
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('review-modal').style.display = 'none';
        });
    }
    
    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (carousel && carouselItems.length > 0) {
        let currentIndex = 0;
        const itemWidth = carouselItems[0].clientWidth;
        const visibleItems = 2;
        const totalItems = carouselItems.length;
        
        // Set initial position
        updateCarousel();
        
        // Auto slide
        let autoSlideInterval = setInterval(nextSlide, 5000);
        
        // Event listeners for buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                clearInterval(autoSlideInterval);
                prevSlide();
                autoSlideInterval = setInterval(nextSlide, 5000);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                clearInterval(autoSlideInterval);
                nextSlide();
                autoSlideInterval = setInterval(nextSlide, 5000);
            });
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % (totalItems - visibleItems + 1);
            updateCarousel();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + (totalItems - visibleItems + 1)) % (totalItems - visibleItems + 1);
            updateCarousel();
        }
        
        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        }
        
        // Update on window resize
        window.addEventListener('resize', function() {
            const newItemWidth = carouselItems[0].clientWidth;
            carousel.style.transform = `translateX(-${currentIndex * newItemWidth}px)`;
        });
    }
    
    // Gallery filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (categoryBtns.length > 0 && galleryItems.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                
                // Filter gallery items
                galleryItems.forEach(item => {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Review form star rating
    const stars = document.querySelectorAll('.star-rating i');
    const ratingInput = document.getElementById('rating');
    
    if (stars.length > 0 && ratingInput) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                ratingInput.value = rating;
                
                // Update star display
                stars.forEach(s => {
                    const sRating = s.getAttribute('data-rating');
                    if (sRating <= rating) {
                        s.classList.remove('fa-regular');
                        s.classList.add('fa-solid');
                    } else {
                        s.classList.remove('fa-solid');
                        s.classList.add('fa-regular');
                    }
                });
            });
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(249, 245, 240, 0.95)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.backgroundColor = 'var(--background-color)';
                header.style.boxShadow = 'none';
            }
        });
    }
    
    // Contact form submission handling
    const contactForm = document.getElementById('contact-form');
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Submit contact form using verification system
            if (window.contactVerification && typeof window.contactVerification.handleContactFormSubmission === 'function') {
                const result = await window.contactVerification.handleContactFormSubmission(contactData);
                
                if (result.success) {
                    // Reset form on successful submission
                    this.reset();
                }
            } else {
                // Fallback if verification system is not loaded
                console.warn('Contact verification system not loaded');
                handleBasicFormSubmit.call(this, e);
            }
        });
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleBasicFormSubmit);
    }
    
    function handleBasicFormSubmit(e) {
        e.preventDefault();
        
        const formElements = this.elements;
        let isValid = true;
        
        // Simple validation
        for (let i = 0; i < formElements.length; i++) {
            if (formElements[i].hasAttribute('required') && !formElements[i].value) {
                isValid = false;
                formElements[i].style.borderColor = 'red';
            } else {
                formElements[i].style.borderColor = '';
            }
        }
        
        if (isValid) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you! Your submission has been received.';
            successMessage.style.color = '#4CAF50';
            successMessage.style.padding = '10px';
            successMessage.style.marginTop = '10px';
            successMessage.style.backgroundColor = '#E8F5E9';
            successMessage.style.borderRadius = '4px';
            
            this.appendChild(successMessage);
            
            // Reset form
            this.reset();
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }
    }
});


    // Load all reviews on page load and after submission
    async function loadReviews() {
        try {
            const response = await fetch('/api/get-reviews');
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const reviews = await response.json();
            renderReviews(reviews);
        } catch (err) {
            if (reviewsContainer) {
                reviewsContainer.innerHTML = '<p>Could not load reviews.</p>';
            }
        }
    }

    function renderReviews(reviews) {
        if (!reviewsContainer) return;
        reviewsContainer.innerHTML = '';
        if (!reviews || reviews.length === 0) {
            if (noReviewsMessage) noReviewsMessage.style.display = 'block';
            return;
        }
        if (noReviewsMessage) noReviewsMessage.style.display = 'none';
        reviews.forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'review-item';
            reviewDiv.innerHTML = `
                <div class="review-header">
                    <span class="review-name">${review.name}</span>
                    <span class="review-rating">${'★'.repeat(review.rating || 0)}</span>
                </div>
                <div class="review-text">${review.reviewText}</div>
            `;
            reviewsContainer.appendChild(reviewDiv);
        });
    }

    loadReviews();

// Lightbox for project galleries and furniture images
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Create lightbox elements once
    const lbOverlay = document.createElement('div');
    lbOverlay.className = 'lightbox-overlay';
    lbOverlay.setAttribute('role', 'dialog');
    lbOverlay.setAttribute('aria-hidden', 'true');

    lbOverlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
      <div class="lightbox-content">
        <img class="lightbox-image" alt="Expanded view" />
      </div>
      <button class="lightbox-next" aria-label="Next">&#10095;</button>
    `;

    document.body.appendChild(lbOverlay);

    const lbImg = lbOverlay.querySelector('.lightbox-image');
    const btnPrev = lbOverlay.querySelector('.lightbox-prev');
    const btnNext = lbOverlay.querySelector('.lightbox-next');
    const btnClose = lbOverlay.querySelector('.lightbox-close');

    let currentIndex = 0;
    let currentList = [];

    function updateNavigationButtons() {
      // Hide/show navigation buttons based on current position
      if (currentIndex === 0) {
        btnPrev.style.display = 'none';
      } else {
        btnPrev.style.display = 'block';
      }
      
      if (currentIndex === currentList.length - 1) {
        btnNext.style.display = 'none';
      } else {
        btnNext.style.display = 'block';
      }
    }

    function openLightbox(list, index) {
      currentList = list;
      currentIndex = index;
      lbImg.src = currentList[currentIndex];
      updateNavigationButtons();
      lbOverlay.classList.add('active');
      lbOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lbOverlay.classList.remove('active');
      lbOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function show(delta) {
      if (!currentList.length) return;
      const newIndex = currentIndex + delta;
      
      // Prevent navigation beyond boundaries
      if (newIndex < 0 || newIndex >= currentList.length) {
        return;
      }
      
      currentIndex = newIndex;
      lbImg.src = currentList[currentIndex];
      updateNavigationButtons();
    }

    btnPrev.addEventListener('click', function() { show(-1); });
    btnNext.addEventListener('click', function() { show(1); });
    btnClose.addEventListener('click', closeLightbox);
    lbOverlay.addEventListener('click', function(e) {
      if (e.target === lbOverlay) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
      if (!lbOverlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') show(-1);
      if (e.key === 'ArrowRight') show(1);
    });

    function collectImages(container) {
      return Array.from(container.querySelectorAll('img'))
        .map(img => img.getAttribute('src'))
        .filter(Boolean);
    }

    function attach(containerSelector, itemSelector) {
      const containers = document.querySelectorAll(containerSelector);
      containers.forEach(container => {
        const list = collectImages(container);
        container.querySelectorAll(itemSelector).forEach((img, idxInNodeList) => {
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', function() {
            // Determine actual index by matching src from list
            const src = img.getAttribute('src');
            const index = list.indexOf(src);
            openLightbox(list, index >= 0 ? index : idxInNodeList);
          });
        });
      });
    }

    // Apply to project gallery grids
    attach('.gallery-grid', '.gallery-item img');
    // Apply to furniture grid on gallery page
    attach('.furniture-grid', '.furniture-item img');
  });
})();