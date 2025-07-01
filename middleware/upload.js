// backend/src/middleware/upload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ApiError = require('../utils/ApiError');

// Configuration de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage pour Multer avec Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            // Définir le dossier Cloudinary en fonction du type de fichier ou de la route
            if (file.fieldname === 'logo') return 'marketplace/logos';
            if (file.fieldname === 'images') return 'marketplace/products';
            if (file.fieldname === 'profilePicture') return 'marketplace/profiles';
            return 'marketplace/others';
        },
        format: async (req, file) => 'png', // ou jpg, webp, etc.
        public_id: (req, file) => {
            // Générer un nom de fichier unique
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `${file.fieldname}-${uniqueSuffix}`;
        },
    },
});

// Configuration du middleware Multer
// 'fields' permet de gérer plusieurs champs de fichier avec des noms différents
exports.upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB par fichier
    fileFilter: (req, file, cb) => {
        // Vérifier le type de fichier
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new ApiError('Seules les images sont autorisées', 400), false);
        }
    }
});

// Comment l'utiliser dans une route :
// router.post('/products', protect, authorize('seller'), upload.array('images', 5), productController.createProduct); // Pour plusieurs images (max 5)
// router.post('/brands', protect, authorize('admin'), upload.single('logo'), brandController.createBrand); // Pour une seule image