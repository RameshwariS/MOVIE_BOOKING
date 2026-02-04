const mongoose = require("mongoose");

//hashing passwd using middleware before saving to db

const bcrypt = require("bcrypt");



const userSchema = new mongoose.Schema({
    name :{
        type:String,
        required :true, 
    },
    email :{
        type:String,
        required :true,},
    password :{
        type:String,
        required :true,
    },
    role :{
        type:String,
        required :true,
        default : "USER"
    }
},{timestamps:true});

userSchema.pre("save", async function(next){
    try {
        //generate salt
        // salt is random val added to hash to make it secure
        const salt = await bcrypt.genSalt(10);
        //hash the passwd using the salt
        const hashedPassword = await bcrypt.hash(this.password,salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", userSchema);
 module.exports = User;