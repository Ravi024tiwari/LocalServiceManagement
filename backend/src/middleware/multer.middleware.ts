import multer from 'multer';

// Use Memory Storage instead of Disk Storage
const storage = multer.memoryStorage();

// Create the upload middleware
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit to protect your server RAM
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.'));
        }
    }
});