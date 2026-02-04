const { error } = require('node:console');
const Theater = require('../models/theater.model');
const mongoose = require('mongoose');

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

const getMoviesInTheater = async (theaterId) => {
  try {
    const theater = await Theater.findById(theaterId).populate("movies");
    return theater.movies;
  } catch (err) {
    if (err.name == "TypeError") {
      return {
        code: 404,
        err: "No theatre found for the given id",
      };
    }
    else {
      console.log("Error is", err);
      throw err;
    }
  }
};

const updateMoviesInTheater = async (theaterId,movieIds,insert) =>{
  try{
      let theater;

      if(insert){
         theater = await Theater.findByIdAndUpdate(
            {_id : theaterId},
            {$addToSet :{movies:{$each : movieIds}}},
            {new:true}

         );

      }
      else{
         // console.log("movieId:", movieIds, typeof movieIds);
           theater = await Theater.findByIdAndUpdate(
            {_id : theaterId},
            {$pull : { movies : { $in: movieIds } }},
  //Sometimes removal fails because movieId is a string, not ObjectId.
            {new:true}

         );
         // return theater;
      }
      return await theater.populate('movies');
  }catch(err){
       if(err.name == 'TypeError') {
            return {
                code: 404,
                err: 'No theatre found for the given id'
            }
        }
        console.log("Error is", err);
        throw err;
  }
}

const checkMovie = async (theaterId) => {
  try {
    const mvs = await Theater.findById(theaterId).populate("movies");
    if(mvs.movies.length > 0){
       return true;
    }
    else{
       return false;
    }
    
  } catch (error) {
   console.log("Error is", err);
        throw err;
  }
}

module.exports = {
    createTheater,getTheater  ,upadteTheater , deleteTheater ,updateMoviesInTheater,getMoviesInTheater,checkMovie
}