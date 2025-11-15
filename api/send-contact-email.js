import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    console.log('send-contact-email handler called');

    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('Received contact data:', { name, email, phone, subject, message });

    // --- ZOHO SMTP CONFIG ---
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,       // smtp.zoho.in
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,                      // Zoho uses SSL on 465
        auth: {
            user: process.env.SMTP_USER,   // info@woodworksstudio.in
            pass: process.env.SMTP_PASS    // <<< your Zoho App Password (from Zoho settings)
        }
    });

    // Your business inbox
    const companyEmail = "info@woodworksstudio.in";

    try {
        // -------- EMAIL TO BUSINESS OWNER (YOU) --------
        await transporter.sendMail({
            from: `"${name}" <${process.env.SMTP_USER}>`,
            to: companyEmail,
            replyTo: email,  // so you can click reply and mail customer directly
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background:#f5f5f5;padding:15px;border-left:4px solid #8B5A2B;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
                <hr>
                <p><em>Sent via the Wood Works Studio contact form.</em></p>
            `
        });

        // -------- CONFIRMATION TO CUSTOMER --------
        await transporter.sendMail({
            from: `"Wood Works Studio" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Thank you for contacting Wood Works Studio",
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to Wood Works Studio. We have received your message and will get back to you shortly.</p>

                <h3>Your Message:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background:#f5f5f5;padding:15px;border-left:4px solid #8B5A2B;">
                    ${message.replace(/\n/g, "<br>")}
                </div>

                <p>Warm regards,<br><strong>Wood Works Studio</strong></p>
            `
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ success: false, message: "Failed to send email" });
    }
}
