const mongoose = require("mongoose")



const subFeatureSchema = new mongoose.Schema({
    name_ar : {
        type : String,
        required : true,
        minlength: [2, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name must be less than 50 characters long']
    },
    name_en : {
        type : String,
        required : true,
        minlength: [2, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name must be less than 50 characters long']
    },
    description_ar : {type : String},
    description_en : {type : String},
    icon : {type: Buffer , requried: true},
    added_by :{type : Object, required : true},
    date: { type: Date, default: Date.now },
}, { timestamps: true });


const featureSchema = new mongoose.Schema({
    name_ar : {
        type : String,
        required : true,
        minlength: [2, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name must be less than 50 characters long']
    },
    name_en : {
        type : String,
        required : true,
        minlength: [2, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name must be less than 50 characters long']
    },
    description_ar : {type : String},
    description_en : {type : String},
    photo : {
        type : Object,
        properties: {
            url: { type: String },        // Vercel Blob public URL
            path: { type: String },       // Storage path
            originalName: { type: String },
            mimeType: { type: String },
            size: { type: Number }
        }
    },
    subFeatures: [subFeatureSchema],  // Array of sub-features
    added_by :{type : Object, required : true},
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Feature",featureSchema)