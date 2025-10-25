/** 
 * Contact Form Verification System
 * Handles submission and feedback for contact form
 */

// Reusable small modal (same as review system)
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

// Function to handle contact form submission
async function submitContactForm(contactData) {
    try {
        const response = await fetch('/api/send-contact-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (data.success) {
            await showMiniModal({
                title: 'Message Sent Successfully!',
                message: 'Thank you for contacting us! We have received your message and will get back to you soon. A confirmation email has been sent to your email address.',
                confirmText: 'OK'
            });
            return { success: true };
        } else {
            await showMiniModal({
                title: 'Error',
                message: 'Failed to send your message. Please try again later or contact us directly.',
                confirmText: 'OK'
            });
            console.error(data.message);
            return { success: false };
        }
    } catch (error) {
        console.error('Error sending contact form:', error);
        await showMiniModal({ 
            title: 'Error', 
            message: 'An error occurred while sending your message. Please check your internet connection and try again.', 
            confirmText: 'OK' 
        });
        return { success: false };
    }
}

// Function to validate contact form data
function validateContactForm(data) {
    const { name, email, subject, message } = data;
    
    // Check required fields
    if (!name || !email || !subject || !message) {
        return { valid: false, message: 'Please fill in all required fields.' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Please enter a valid email address.' };
    }
    
    // Check minimum lengths
    if (name.trim().length < 2) {
        return { valid: false, message: 'Name must be at least 2 characters long.' };
    }
    
    if (subject.trim().length < 3) {
        return { valid: false, message: 'Subject must be at least 3 characters long.' };
    }
    
    if (message.trim().length < 10) {
        return { valid: false, message: 'Message must be at least 10 characters long.' };
    }
    
    return { valid: true };
}

// Function to handle form submission with validation
async function handleContactFormSubmission(formData) {
    // Validate form data
    const validation = validateContactForm(formData);
    
    if (!validation.valid) {
        await showMiniModal({
            title: 'Validation Error',
            message: validation.message,
            confirmText: 'OK'
        });
        return { success: false };
    }
    
    // Submit the form
    return await submitContactForm(formData);
}

// Make functions globally accessible
window.contactVerification = {
    submitContactForm,
    validateContactForm,
    handleContactFormSubmission,
    showMiniModal
};