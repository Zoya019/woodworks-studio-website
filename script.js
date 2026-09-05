document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year automatically
    const footerYearElements = document.querySelectorAll('.footer-year');
    const currentYear = new Date().getFullYear();
    
    footerYearElements.forEach(element => {
        element.textContent = currentYear;
    });
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
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
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            lenis.scrollTo(targetElement, { offset: -100 });
        }
    });
});

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


document.addEventListener('DOMContentLoaded', function () {
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });
  }
});


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

document.addEventListener('DOMContentLoaded', function () {
  const scrollEl = document.querySelector('.reasons-scroll');
  const dragCursor = document.getElementById('dragCursor');

  if (!scrollEl || !dragCursor) return;

  let isDown = false;
  let startX;
  let scrollStart;
  let lastX;
  let velocity = 0;
  let rafId;

  scrollEl.addEventListener('mouseenter', () => {
    dragCursor.classList.add('visible');
  });

  scrollEl.addEventListener('mouseleave', () => {
    dragCursor.classList.remove('visible');
    endDrag();
  });

  scrollEl.addEventListener('mousemove', (e) => {
    dragCursor.style.left = e.clientX + 'px';
    dragCursor.style.top = e.clientY + 'px';
  });

  scrollEl.addEventListener('mousedown', (e) => {
    isDown = true;
    cancelAnimationFrame(rafId);
    scrollEl.classList.add('dragging');
    startX = e.pageX;
    lastX = e.pageX;
    scrollStart = scrollEl.scrollLeft;
    velocity = 0;
  });

  window.addEventListener('mouseup', endDrag);

  scrollEl.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();

    const delta = e.pageX - lastX;
    velocity = delta;
    lastX = e.pageX;

    scrollEl.scrollLeft -= delta; // 1:1 movement — no jump, tracks the cursor exactly
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    scrollEl.classList.remove('dragging');
    applyMomentum();
  }

  function applyMomentum() {
    if (Math.abs(velocity) < 0.5) return;

    scrollEl.scrollLeft -= velocity;
    velocity *= 0.92; // friction — tweak closer to 1 for longer glide, lower for quicker stop

    rafId = requestAnimationFrame(applyMomentum);
  }
});

//Lenis smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

let usingGsapTicker = false;

window.addEventListener('load', function () {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    usingGsapTicker = true;
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);
  }
});

// Fallback rAF loop — only runs if GSAP ticker never takes over
function raf(time) {
  if (!usingGsapTicker) {
    lenis.raf(time);
  }
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);