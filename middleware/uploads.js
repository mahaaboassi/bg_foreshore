const multer = require('multer');
const { put } = require('@vercel/blob');
const path = require('path');


// Middleware to set category for the "type" endpoint
const setCategory = (category) => (req, res, next) => {
    req.category = category; // Add category to the request object
    next();
};

// Use memory storage to avoid file system writes
const storage = multer.memoryStorage();


const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, callback) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return callback(null, true);
        } else {
            callback(new Error('Error: Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

// Middleware to upload to Vercel Blob
const uploadToVercelBlob = async (req, res, next) => {
    if (!req.file) {
        // Skip the upload if no file is provided
        console.warn("No file provided for upload.");
        
        return next();
    }
    try {
        
        const category = req.category || 'default';
        const filename = `${category}/${Date.now()}-${req.file.originalname}`;

        const blob = await put(filename, req.file.buffer, {
            access: 'public',
            token : process.env.BLOB_XX_ABCDEFGHIJKLMNOPQRSTUVWXY_READ_WRITE_TOKEN ,
            contentType: req.file.mimetype
        });

        const fileInfo = {
            // Unique identifier for the file
            id: blob.url.split('/').pop(), 
            
            // Full public URL - use this to access the file from frontend
            url: blob.url,
            
            // Path used for storage reference
            path: filename,
            // Original file details
            originalName: req.file.originalname,
            category: category,
            mimeType: req.file.mimetype,
            size: req.file.size
        };

        // Attach file info to request for use in next middleware/controller
        req.fileInfo = fileInfo;

        next();
    } catch (error) {
        console.error('Vercel Blob Upload Error:', error);
        res.status(500).json({
            error: 1,
            data: [],
            message: 'File upload failed', 
            details: error.message,
            status: 500
        });
    }
};

// Error handler for multer (for handling file too large)
const handleFileUploadError = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {
        // If the error is from multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                    error: 1,
                    data: [],
                    message: "File is too large. Maximum size is 2MB.",
                    status: 400
            });
        }
        return res.status(400).json({
            error: 1,
            data: [],
            message: "Multer error occurred during file upload.",
            status: 400
            
        });
    } else if (err) {
        // Any other error
        return res.status(500).json({
            error: 1,
            data: [],
            message: "Server error."
        });
    }
    next(); // Continue to the next middleware
};
module.exports = {
    upload,
    uploadToVercelBlob,
    setCategory,
    handleFileUploadError
};