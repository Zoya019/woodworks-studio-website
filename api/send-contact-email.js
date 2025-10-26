// CommonJS version, works on Vercel
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    console.log('send-contact-email handler called');

    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Log the incoming contact data
    console.log('Received contact data:', { name, email, phone, subject, message });

    // --- SMTP Logging & Transporter Setup ---
    console.log('SMTP Env variables:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
    });

    const securePort = Number(process.env.SMTP_PORT) === 465;

    let transporter;
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const useRealSMTP = smtpHost && smtpHost !== 'localhost' && smtpHost !== '127.0.0.1' && smtpUser && smtpPass;

    if (useRealSMTP) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: securePort, // true for 465 (SSL), false for 587 (TLS)
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
    } else {
        console.warn('SMTP env not set or pointing to localhost; using Nodemailer jsonTransport for local testing only.');
        transporter = nodemailer.createTransport({ jsonTransport: true });
    }

    // Company email address
    const companyEmail = 'woodworksstudiocrafts@gmail.com';

    // --- Sending Email to Company ---
    console.log('Attempting to send contact email to company:', companyEmail);

    try {
        // Send email to company
        await transporter.sendMail({
            // Prefer showing the customer name + email as the From
            // Gmail may still rewrite; we also set Sender and envelope
            from: { name: name, address: email },
            sender: process.env.SMTP_USER,
            envelope: { from: process.env.SMTP_USER, to: companyEmail },
            to: companyEmail,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #8B5A2B; margin: 10px 0;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <hr>
                <p><em>This message was sent through the Wood Works Studio contact form.</em></p>
            `,
            replyTo: { name: name, address: email },
            headers: { 'X-Original-From': `${name} <${email}>`, 'X-Author': process.env.SMTP_USER }
        });

        // Send confirmation email to customer
        await transporter.sendMail({
            from: `"Wood Works Studio" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Thank you for contacting Wood Works Studio',
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for contacting Wood Works Studio. We have received your message and will get back to you soon.</p>
                
                <h3>Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #8B5A2B; margin: 10px 0;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                
                <p>We typically respond within 24-48 hours during business days.</p>
                
                <p>Best regards,<br>
                Wood Works Studio Team</p>
                
                <hr>
                <p style="font-size: 12px; color: #666;">
                Wood Works Studio<br>
                123 Woodcraft Lane, Mumbai, India<br>
                Phone: +91 9876543210<br>
                Email: info@woodworksstudio.com
                </p>
            `
        });

        console.log('Contact emails sent successfully');
        res.status(200).json({ success: true, message: 'Contact form submitted successfully' });

    } catch (error) {
        console.error('Email send error:', error);

        // More detailed error message for debugging
        const errorMsg = error.response || error.message || error.toString();
        res.status(500).json({ success: false, message: `Failed to send email: ${errorMsg}` });
    }
};