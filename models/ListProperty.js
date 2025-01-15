const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema({
    url: { type: String, required: true }, // Vercel Blob public URL
    path: { type: String, required: true }, // Storage path
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  });

const ListSchema = new mongoose.Schema({
    title : {
        type : String,
    },
    description : { type : String },
    type : { type : String},
    files: {
        type: [fileSchema], // Array of file objects
        default: [],        // Default to an empty array
      },
    furnishing : {  type: String,enum : ["0","1"],default : "0" },
    ready : {  type: String,enum : ["0","1"],default : "0" },
    name:{
        type : String,
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters long']
    },
    email :{        
        type: String,
        required: [true, 'Email is required'], // This is correct 
        match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Validates email format },
    },
    country_dial: { 
        type: String, 
        required: true,  // Country code is mandatory
        match: [/^\+\d{1,4}$/, 'Please provide a valid country code'],  // Validates that the country code starts with "+" and is followed by 1-4 digits
    },
    country_name: { 
        type: String, 
        required: true,  // Country code is mandatory
    },
    country_code: { 
        type: String, 
        required: true,  // Country code is mandatory (e.g., 'AF', 'US')
        match: [/^[A-Z]{2}$/, 'Please provide a valid 2-letter country code'],  // Validates that country code is 2 uppercase letters (e.g., 'AF', 'US')
    },
    phone_number: { 
        type: String, 
        required: true,  // Phone number is mandatory
        match: [/^\d{10,15}$/, 'Please provide a valid phone number'],  // Validates phone number format (10-15 digits)
    },
    role: {
        type: String,
        enum: ['admin', 'user'],  // Only allow these roles
        default: 'user'  // Default role is 'user'
    },
    bathrooms : {type : Number },
    bedrooms : { type : Number},
    beds : { type : Number},
    guests : { type : Number},
    city : { type : String},
    region : {type : String},
    street : {type : String},
    building : {type : String},
    floor : {type : String},
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("List",ListSchema)