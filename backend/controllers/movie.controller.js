const movieService = require('../services/movie.service')

const createMovie = async (req, res) => {
    try {
        const response = await movieService.createMovie(req.body);

        if (response.err) {
            return res.status(response.code).json({
                err: response.err,
                data: {},
                msg: "something went wrong",
                success: false
            });
        }

        return res.status(200).json({
            err: {},
            data: response,
            msg: "success!",
            success: true
        });

    } catch (err) {
        console.log(err, "in movie creation");
        return res.status(500).json({
            err: err.message,
            data: {},
            msg: "something went wrong",
            success: false
        });
    }
}

const deleteMovie = async (req, res) => {
    try {
        const response = await movieService.deleteMovie(req.params.id);

        if (response.err) {
            return res.status(response.code).json({
                err: response.err,
                data: {},
                msg: "something went wrong",
                success: false
            });
        }

        return res.status(200).json({
            err: {},
            data: response,
            msg: "success!",
            success: true
        });

    } catch (err) {
        console.log(err, "in movie deletion");
        return res.status(500).json({
            err: err.message,
            data: {},
            msg: "something went wrong",
            success: false
        });
    }
}

const getMovie = async (req, res) => {
    try {
        const response = await movieService.getMovieById(req.params.id);

        if (response.err) {
            return res.status(response.code).json({
                err: response.err,
                data: {},
                msg: "something went wrong",
                success: false
            });
        }

        return res.status(200).json({
            err: {},
            data: response,
            msg: "success!",
            success: true
        });

    } catch (err) {
        console.log(err, "in movie finding");
        return res.status(500).json({
            err: err.message,
            data: {},
            msg: "something went wrong",
            success: false
        });
    }
}

module.exports = { createMovie, deleteMovie, getMovie }
