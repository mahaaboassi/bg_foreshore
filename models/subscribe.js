const mongoose = require("mongoose")


const EmailSchema = new mongoose.Schema({

    email :{        
        type: String,
        required: [true, 'Email is required'], // This is correct 
        match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Validates email format },
    },

    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Emails",EmailSchema)