// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: './config/config.env' }); // Ajustez le chemin si nécessaire

/**
 * Configure et envoie un email.
 * @param {object} options - Options de l'email (email du destinataire, sujet, message, etc.).
 */
exports.sendEmail = async (options) => {
    // 1. Créer un transporteur (ex: avec Gmail, SendGrid, ou un serveur SMTP personnalisé)
    // Pour Gmail (moins recommandé pour la production, mais facile pour les tests) :
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: process.env.EMAIL_USERNAME, // Votre adresse Gmail
    //         pass: process.env.EMAIL_PASSWORD  // Votre mot de passe d'application Gmail
    //     }
    // });

    // Recommandé : Utiliser un service SMTP dédié (Mailtrap pour le dev, SendGrid/Mailgun pour la production)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465 ? true : false, // true pour 465, false pour les autres ports (ex: 587)
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Utile pour certains serveurs de dev comme Mailtrap
        }
    });

    // 2. Définir les options de l'email
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Expéditeur
        to: options.email,       // Destinataire
        subject: options.subject, // Sujet
        text: options.message,   // Contenu en texte brut
        // html: `<h1>${options.subject}</h1><p>${options.message}</p>` // Contenu en HTML (plus joli)
    };

    // 3. Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
};

// Exemple de fonction pour l'envoi d'email de vérification (à appeler depuis authService)
// exports.sendVerificationEmail = async (email, verificationToken) => {
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
//     const message = `Veuillez vérifier votre email en cliquant sur ce lien : \n\n ${verificationUrl}`;
//     await exports.sendEmail({
//         email,
//         subject: 'Vérifiez votre email pour votre compte',
//         message
//     });
// };