const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters long']
    },
    email :{        
        type: String,
        required: [true, 'Email is required'], // This is correct
        unique: true, // Ensures that the email is unique in the collection
        match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Validates email format },
    },
    password :{ type: String, required: true },
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
    gender :{
        type: String, // Store as a single string
        enum : ["0","1"],
        default : "0"
    },
    birthday :{ type :String },
    file :{
        type: Object,
        properties: {
            url: { type: String },        // Vercel Blob public URL
            path: { type: String },       // Storage path
            originalName: { type: String },
            mimeType: { type: String },
            size: { type: Number }
        }
    },
    active : {  type: String,enum : ["0","1"],default : "0" },
    country : {type : String },
    added_by :{type : String},
    date: { type: Date, default: Date.now },
})



module.exports = mongoose.model("User",userSchema)

// async function verifyPassword(inputPassword, storedPassword) {
//     const isMatch = await bcrypt.compare(inputPassword, storedPassword);
//     return isMatch;  // Returns true if passwords match, false otherwise
// }