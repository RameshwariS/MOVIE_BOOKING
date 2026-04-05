const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: Number, required: true },
    description: { type: String, required: false },
    rating: { type: Number, required: false },
    isopen: { type: Boolean, default: true },
   movies :{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Movie',
        required: false,
     //    unique: true,
   }
}, { timestamps: true });

const Theater = mongoose.model('Theater', theaterSchema);

module.exports = Theater;