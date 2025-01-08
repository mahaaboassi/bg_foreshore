const path = require("path")
const multer = require("multer")
const fs = require('fs');

var storage = multer.diskStorage({
    destination  : function(req,file,cb){
        const category = req.category || 'default'; // Backend defines the category

        cb(null, `uploads/${category}`); // Set the upload directory
    },
    filename : function(req,file,cb){
        
        let ext = path.extname(file.originalname)
        cb(null, Date.now()+ext)
    }
})

var uplaod = multer({
    storage : storage,
    fileFilter : function(req,file,callback){
        if(
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/gif" ||
            file.mimetype === "image/webp" ||
            file.mimetype === "image/bmp"
    
        ){
            callback(null,true)
        } else {
            console.log("Only jpg & png file")
            callback(null,false)
        }
    },
    limits : {
        fieldSize : 1024 *1024 *2
    }
})

module.exports = uplaod