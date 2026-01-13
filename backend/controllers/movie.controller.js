const Movie  = require('../models/movie.model');

const createMovie = async (req, res)=>{
    try {
        const movie = await Movie.create(req.body);
        return res.status(201).json({
            success : true,
            data :movie,
            error :{},
            msg :"movie created!"
        });
    } catch(err){
        console.log(err, "in movie creation");
         return res.status(500).json({
            success : false,
            data :{},
            error :err,
            msg :"something went wrong!"
        });
    }
}; 

module.exports = {createMovie};