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

// Common file filter function
const fileFilter = (req, file, callback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        callback(null, true);
    } else {
        callback(new Error('Error: Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});
const uploadMulti = multer({ 
    storage: storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
}).array("files",20);

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
const uploadToVercelBlobMulti = async (req, res, next) => {
      
    if (!req.files || req.files.length === 0) {
        console.warn("No files provided for upload.");
        return next();
    }

    try {
        const category = req.category || 'default';
        const fileInfos = await Promise.all(
            req.files.map(async (file) => {
                const filename = `${category}/${Date.now()}-${file.originalname}`;

                const blob = await put(filename, file.buffer, {
                    access: 'public',
                    token: process.env.BLOB_XX_ABCDEFGHIJKLMNOPQRSTUVWXY_READ_WRITE_TOKEN,
                    contentType: file.mimetype,
                });

                return {
                    id: blob.url.split('/').pop(),
                    url: blob.url,
                    path: filename,
                    originalName: file.originalname,
                    category,
                    mimeType: file.mimetype,
                    size: file.size,
                };
            })
        );
        
        req.fileInfos = fileInfos;
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
// Error handler for multer
const handleFileUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? "File is too large. Maximum size is 5MB." : "Multer error occurred during file upload.";
        return res.status(400).json({ error: 1, message });
    }

    if (err) {
        console.error(err);
        return res.status(500).json({ error: 1, message: "Server error." });
    }

    next();
};
module.exports = {
    upload,
    uploadToVercelBlob,
    uploadToVercelBlobMulti,
    setCategory,
    handleFileUploadError ,
    uploadMulti
};