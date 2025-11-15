import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // ZOHO SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,           // smtp.zoho.in
        port: Number(process.env.SMTP_PORT),   // 465
        secure: true,
        auth: {
            user: process.env.SMTP_USER,       // info@woodworksstudio.in
            pass: process.env.SMTP_PASS        // Zoho app password
        }
    });

    const businessEmail = "info@woodworksstudio.in";

    try {
        // -------- Email to BUSINESS --------
        await transporter.sendMail({
            from: `"Wood Works Studio Website" <info@woodworksstudio.in>`,   // FIXED
            replyTo: `${name} <${email}>`,
            to: businessEmail,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background:#f5f5f5;padding:10px;border-left:4px solid #8B5A2B;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
            `
        });

        // -------- Confirmation Email --------
        await transporter.sendMail({
            from: `"Wood Works Studio" <info@woodworksstudio.in>`,   // FIXED
            to: email,
            subject: `Thank you for contacting Wood Works Studio`,
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for your message! We will get back to you shortly.</p>
                <h3>Your message:</h3>
                <div style="background:#f5f5f5;padding:10px;border-left:4px solid #8B5A2B;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
                <p>Warm regards,<br>Wood Works Studio</p>
            `
        });

        res.status(200).json({ success: true });

    } catch (err) {
        console.error("Error sending email:", err);
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
}
