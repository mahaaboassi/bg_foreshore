const mongoose = require("mongoose")


const MessageSchema = new mongoose.Schema({

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
    message : {
        type : String,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],  // Only allow these roles
        default: 'user'  // Default role is 'user'
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
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Messages",MessageSchema)