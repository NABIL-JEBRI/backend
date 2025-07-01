// backend/src/config/email.js
const nodemailer = require('nodemailer');

/**
 * @desc Configures and returns a Nodemailer transporter.
 * Email host, port, username, and password are retrieved from environment variables.
 * @returns {object} A Nodemailer transporter object.
 */
const createEmailTransporter = () => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.warn('WARNING: Email SMTP credentials are not fully defined in environment variables. Email sending may fail.');
        // In production, consider throwing an error here.
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // Use 'true' for 465 (SSL/TLS), 'false' for other ports like 587 (STARTTLS)
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Optional: Add TLS options for self-signed certificates or specific security needs
        // tls: {
        //     rejectUnauthorized: false
        // }
    });

    console.log('Email transporter configured.');
    return transporter;
};

/**
 * @desc Basic email sending options derived from environment variables.
 */
const emailConfig = {
    from: process.env.EMAIL_FROM || 'noreply@yourmarketplace.com', // Default sender address
    transporter: createEmailTransporter() // The configured Nodemailer transporter
};

module.exports = emailConfig;