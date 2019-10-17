const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user Schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String, 
        required: true,
        min: 8
    }
},
{
    timestamps: true
})


module.exports = mongoose.model('userData', UserSchema);