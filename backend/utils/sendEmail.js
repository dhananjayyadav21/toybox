import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, text, html }) => {
  try {
    // Select built-in Nodemailer profiles for Gmail if specified, otherwise generic SMTP
    const isGmail = (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) || 
                    (process.env.SMTP_USER && process.env.SMTP_USER.endsWith('@gmail.com'));

    const transportOptions = isGmail 
      ? {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        }
      : {
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || 'mock_user@toybox.com',
            pass: process.env.SMTP_PASS || 'mock_password_key',
          },
        };

    const transporter = nodemailer.createTransport(transportOptions);

    const mailOptions = {
      from: `"ToyBox Store" <${process.env.SMTP_FROM || 'noreply@toybox.com'}>`,
      to: email,
      subject: subject,
      text: text,
      html: html,
    };

    // If mock or ethereal defaults, print to console as fallback simulation
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'mock_user@toybox.com') {
      console.log('========================================================================');
      console.log(`[EMAIL SIMULATION] Sent To: ${email}`);
      console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
      console.log(`[EMAIL SIMULATION] Content:\n${text}`);
      console.log('========================================================================');
      return { simulated: true, text };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('⚠️ [EMAIL SMTP ERROR] Failed to dispatch real email:', error.message || error);
    console.log('========================= DEVELOPER LOG FALLBACK =========================');
    console.log(`[FALLBACK] Sent To: ${email}`);
    console.log(`[FALLBACK] Subject: ${subject}`);
    console.log(`[FALLBACK] Raw Content:\n${text}`);
    console.log('==========================================================================');
    return { error: error.message, simulated: true, text };
  }
};
