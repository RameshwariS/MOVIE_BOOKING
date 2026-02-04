const mongoose = require('mongoose')
const { release } = require('os')

const movieSchema = new mongoose.Schema({
    name :{
        type:String,
        required :true,
    },
    description:{
        type:String,
        required :true,
    },
    trailerURL :{
        type : String, // will store the location
    },
    casts :{
        type : [String]
    },
    language :{
        type : [String],
        required :true,
        default :["ENG"]
    },
    releaseDate :{
        type :String,
        required :true
    },
    director :{
         type :String,
        required :true
    },
    releaseStatus :{
        type :String,
        required :true,
        default : "RELEASED"
    }, 
    theaters :{ 
        type: [mongoose.Schema.Types.ObjectId],
        ref : 'Theater',
        required : false,
    }
},{timestamps:true}); //timestamps gives created n updated at automatically

const movie= mongoose.model("Movie",movieSchema);

module.exports = movie