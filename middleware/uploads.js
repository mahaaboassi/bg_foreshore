const path = require("path")
const multer = require("multer")
const fs = require('fs');



// Middleware to set category for the "type" endpoint
const setCategory = (category) => (req, res, next) => {
    req.category = category; // Add category to the request object
    next();
};

var storage = multer.diskStorage({
    destination  : function(req,file,cb){
        const category = req.category || 'default'; // Backend defines the category
        // const uploadDir = path.join(__dirname, `uploads/${category}`);
        const uploadPath = path.join(process.cwd(), 'uploads', category);
  
         // Create directory if it doesn't exist
         fs.mkdirSync(uploadPath, { recursive: true });
        
         cb(null, uploadPath);
        // cb(null, `uploads/${category}`); // Set the upload directory
    },
    filename : function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        // let ext = path.extname(file.originalname)
        // cb(null, Date.now()+ext)
    }
})

const  upload = multer({
    storage : storage,
    fileFilter : function(req,file,callback){
        const allowedMimeTypes = [
            "image/png", 
            "image/jpg", 
            "image/jpeg", 
            "image/gif", 
            "image/webp", 
            "image/bmp"
        ];
    
        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.error(`Rejected file: ${file.originalname}. Unsupported file type: ${file.mimetype}`);
            callback(new Error('Unsupported file type. Only image files are allowed.'), false);
        }
    },
    limits : {
        fieldSize : 1024 *1024 *2
    }
})
// Error handling middleware for multer
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    } else if (err) {
        // Other errors (like file type)
        return res.status(400).json({
            error: 'Upload error',
            message: err.message
        });
    }
    next();
};
module.exports = {
    setCategory,
    upload,
    multerErrorHandler
}