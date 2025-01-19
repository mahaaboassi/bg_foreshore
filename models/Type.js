const mongoose = require("mongoose")

const typeSchema = new mongoose.Schema({
    name_ar : {
        type : String,
        required : true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters long']
    },
    name_en : {
        type : String,
        required : true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters long']
    },
    description_ar : {
        type : String,
    },
    description_en : {
        type : String,
    },
    photo :{
        type: Object,
        properties: {
            url: { type: String },        // Vercel Blob public URL
            path: { type: String },       // Storage path
            originalName: { type: String },
            mimeType: { type: String },
            size: { type: Number }
        }
    },
    added_by :{type : Object, required : true},
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Type",typeSchema)