const theaterServices = require('../services/theater.service');

const createTheater = async (req, res) => {
 const result = await theaterServices.createTheater(req.body);
 if(result.err){
    return res.status(result.code).json({
        err: result.err,
        data: {},
        msg: "something went wrong",
        success: false
    })
 }  
    return res.status(200).json({   
        err: {},
        data: result,
        msg: "Theater created successfully",
        success: true
    })  ;
}


const getTheater = async (req, res) => {
 const result = await theaterServices.getTheater(req.params.id);
 if(result.err){
    return res.status(result.code).json({
        err: result.err,
        data: {},
        msg: "something went wrong",
        success: false
    })
 }  
    return res.status(200).json({   
        err: {},
        data: result,
        msg: "Theater fetched successfully",
        success: true
    })  ;
}

const getTheaters = async (req, res) => {
 const result = await theaterServices.fetchTheaters(req.query);
 if (result.err) {
   return res.status(result.code).json({
     err: result.err,
     data: {},
     msg: "something went wrong",
     success: false,
   });
 }
 return res.status(200).json({
   err: {},
   data: result,
   msg: "Theaters fetched successfully",
   success: true,
 });
};


const updateTheater = async (req, res) => {
 const result = await theaterServices.updateTheater(req.params.id, req.body);
 if(result.err){
    return res.status(result.code).json({
        err: result.err,
        data: {},
        msg: "something went wrong",
        success: false
    })
 }  
    return res.status(200).json({   
        err: {},
        data: result,
        msg: "Theater updated successfully",
        success: true
    })  ;
}


const deleteTheater = async (req, res) => {
 const result = await theaterServices.deleteTheater(req.params.id);
 if(result.err){
    return res.status(result.code).json({
        err: result.err,
        data: {},
        msg: "something went wrong",
        success: false
    })
 }  
    return res.status(200).json({   
        err: {},
        data: result,
        msg: "Theater deleted successfully",
        success: true
    })  ;
}

const updateMoviesInTheater = async (req, res) => {
 const result = await theaterServices.updateMoviesInTheater(
   req.params.id,
   req.body.movieIds,
   req.body.insert
 );
 if(result.err){
    return res.status(result.code).json({
        err: result.err,
        data: {},
        success: false,
        msg: "something went wrong",
    })};
    return res.status(200).json({
        err:{},
        data: result,
        msg: "Movies updated in theater successfully",
        success:true
    })
 }


 const getMoviesInTheater = async (req, res) => {
   const result = await theaterServices.getMoviesInTheater(req.params.id);
   if (result.err) {
     return res.status(result.code).json({
       err: result.err,
     });
   }
   return res.status(200).json({
     err: {},
     data: result,
     msg: "Movies fetched successfully",
     success: true,
   });
 };

const checkMovie = async (req, res) => {
  const result = await theaterServices.checkMovie(req.params.theaterId);
  return result;
};

module.exports = {
  createTheater,
  getTheater,
  getTheaters,
  updateTheater,
  deleteTheater,
  updateMoviesInTheater,
  getMoviesInTheater,
};
