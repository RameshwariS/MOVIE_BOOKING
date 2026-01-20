const Theater = require('../models/theater.model');

const createTheater = async(req,res)=>{
   try {
     
        const theater = Theater.create(req.body);
        return theater;
   } catch (error) {
    console.log("error in theater creation service",error);
    throw error;
   }
      
}

const getTheater = async(req,res)=>{
   try {
     
        const theater = Theater.findById(req.params.id);
        return theater;
   } catch (error) {
    console.log("error in theater creation service",error);
    throw error;
   }
      
}


const upadteTheater = async(req,res)=>{
   try {
     
        const theater = Theater.findByIdAndUpdate(req.params.id,req.body,{new:true});
        return theater;
   } catch (error) {
    console.log("error in theater creation service",error);
    throw error;
   }
      
}

const deleteTheater = async(req,res)=>{
   try {
     
        const response = Theater.findByIdAndDelete(req.params.id);
      //  if(!response){
      //    err : "no theater found"
      //  }
      return response;
   } catch (error) {
    console.log("error in theater creation service",error);
    throw error;
   }
}
module.exports = {
    createTheater,getTheater  ,upadteTheater , deleteTheater 
}