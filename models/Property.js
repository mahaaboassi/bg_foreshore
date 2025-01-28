const mongoose = require("mongoose")
const feature = require("./feature")


const fileSchema = new mongoose.Schema({
    url: { type: String, required: true }, // Vercel Blob public URL
    path: { type: String, required: true }, // Storage path
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  });
const subFeatureSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Root feature ID
    name_ar : { type :String},
    name_en : { type :String},
    icon : { type : Buffer }
    });
const featureSchema = new mongoose.Schema({
    id : { type: String, required: true }, // Root feature ID
    name_ar : { type :String},
    name_en : { type :String},
    icon : { type :Object,
        properties: {
            url: { type: String },        // Vercel Blob public URL
            path: { type: String },       // Storage path
            originalName: { type: String },
            mimeType: { type: String },
            size: { type: Number }
                }
        },
    subFeatures: { type: [subFeatureSchema], default: [] }, // Array of sub-feature IDs
    });
const propertySchema = new mongoose.Schema({
    name_ar : {
        type : String,
        required : true,
        minlength: [3, 'Name must be at least 3 characters long'],
    },
    name_en : {
        type : String,
        required : true,
        minlength: [3, 'Name must be at least 3 characters long'],
    },
    description_ar : { type : String },
    description_en : { type : String },
    features :{  type : [featureSchema],default: [] },
    type : { type : Object, required : true},
    files: {
        type: [fileSchema], // Array of file objects
        default: [],        // Default to an empty array
      },
    furnishing : {  type: String,enum : ["0","1"],default : "0" },
    ready : {  type: String,enum : ["0","1"],default : "0" },
    owner : {type: Object,required : true},
    bathrooms : {type : Number,required : true },
    bedrooms : { type : Number, required : true},
    beds : { type : Number, required : true},
    guests : { type : Number, required : true},
    city : { type : String, required : true},
    region : {type : String, required : true},
    street : {type : String, required : true},
    building : {type : String, required : true},
    floor : {type : String, required : true},
    added_by :{type : Object, required : true},
    registration_number : {type : String, required : true},
    rms_link : {type : String, required : true},
    link_map : {type : String, required : true},
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Properties",propertySchema)
