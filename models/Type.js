const mongoose = require("mongoose")

const typeSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters long']
    },
    description : {
        type : String,
    },
    photo : {
        type : String,
    },
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Type",typeSchema)