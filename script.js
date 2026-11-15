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
    
    // In-page links (menus, buttons, footer): always glide to the section,
    // never jump. Handled globally below (wwsSmoothTo) so every page gets it.

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


// Smooth scrolling (Lenis). Smooths mouse-wheel / trackpad scrolling on
// desktop; touch scrolling stays native (Lenis default). One animation loop
// that rests while the page is idle and wakes on the next wheel, key or scroll.
var lenis = null;
if (typeof Lenis !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    document.documentElement.classList.add('lenis');
    var lenisRunning = false, lenisIdle = 0;
    var lenisLoop = function (time) {
      lenis.raf(time);
      // stop after ~0.5 s without movement; wake again on input
      if (lenis.isScrolling) { lenisIdle = 0; } else { lenisIdle++; }
      if (lenisIdle > 30) { lenisRunning = false; return; }
      requestAnimationFrame(lenisLoop);
    };
    var wakeLenis = function () {
      lenisIdle = 0;
      if (!lenisRunning) {
        lenisRunning = true;
        lenis.time = undefined; // restart the clock so the first frame after a rest glides
        requestAnimationFrame(lenisLoop);
      }
    };
    ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, wakeLenis, { passive: true });
    });
    var lenisScrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = function (target, opts) { wakeLenis(); return lenisScrollTo(target, opts); };
    wakeLenis();
  } catch (e) {
    lenis = null;
  }
}


// ---------------------------------------------------------------------------
// Smooth scroll to sections for every in-page link on every page.
// Works for "#contact", "index.html#contact" (when already on the homepage)
// and links arriving from another page (the head script strips the hash so
// the browser does not jump; we glide there once the page has loaded).
// ---------------------------------------------------------------------------
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function headerOffset(el) {
    if (!el || el.id === 'top') return 0;
    var h = document.querySelector('.gx-head, .wh-sticky, .site-header, body > header');
    var hh = h ? h.getBoundingClientRect().height : 0;
    return hh > 0 && hh < 140 ? hh : 0;
  }
  function samePage(url) {
    var norm = function (p) { return p.replace(/index\.html$/, '').replace(/\/$/, '') || '/'; };
    return url.origin === location.origin && norm(url.pathname) === norm(location.pathname) && url.search === location.search;
  }
  window.wwsSmoothTo = function (hash, opts) {
    if (!hash || hash === '#') return false;
    var el = null;
    try { el = hash === '#top' ? document.body : document.querySelector(hash); } catch (e) { el = null; }
    if (!el) return false;
    var off = hash === '#top' ? 0 : headerOffset(el);
    var top = hash === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - off;
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(top, { duration: (opts && opts.duration) || 1.4 });
    } else {
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }
    return true;
  };
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-smooth')) return;
    var href = a.getAttribute('href');
    if (!href || href.indexOf('#') === -1 || href === '#') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (!url.hash || !samePage(url)) return;
    if (window.wwsSmoothTo(url.hash)) {
      e.preventDefault();
      if (history.pushState) history.pushState(null, '', url.hash);
    }
  });
  // Arrived from another page with a #section: glide there after load
  function arrive() {
    var h = window.__wwsHash;
    if (!h) return;
    window.__wwsHash = null;
    setTimeout(function () {
      if (window.wwsSmoothTo(h, { duration: 1.6 }) && history.replaceState) history.replaceState(null, '', h);
    }, 250);
  }
  if (document.readyState === 'complete') arrive(); else window.addEventListener('load', arrive);
})();
