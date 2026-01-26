const theaterServices = require('../services/theater.service');

const createTheater = async(req,res)=>{
 const result = await  theaterServices.createTheater(req,res);
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


const getTheater = async(req,res)=>{
 const result = await  theaterServices.getTheater(req,res);
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


const updateTheater = async(req,res)=>{
 const result = await  theaterServices.upadteTheater(req,res);
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


const deleteTheater = async(req,res)=>{
 const result = await  theaterServices.deleteTheater(req,res);
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

const updateMoviesInTheater = async (req,res) =>{
 const result = await theaterServices.updateMoviesInTheater(
    req.params.id,
    req.body.movieIds,
    req.body.insert);
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

module.exports = {createTheater,getTheater,updateTheater,deleteTheater,updateMoviesInTheater};