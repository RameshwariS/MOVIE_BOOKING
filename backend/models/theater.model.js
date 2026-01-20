const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: Number, required: true },
    description: { type: Number, required: false },
    rating: { type: Number, required: false },
    isopen: { type: Boolean, default: true },
   
}, { timestamps: true });

const Theater = mongoose.model('Theater', theaterSchema);

module.exports = Theater;