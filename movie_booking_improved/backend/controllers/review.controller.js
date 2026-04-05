const Review = require('../models/review.model');

const addReview = async (req, res) => {
    try {
        const { movie, rating, comment } = req.body;
        const review = await Review.create({
            user: req.user.id,
            movie,
            rating,
            comment
        });
        return res.status(201).json({ success: true, data: review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, err: 'You have already reviewed this movie.' });
        }
        return res.status(500).json({ success: false, err: err.message });
    }
};

const getMovieReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ movie: req.params.movieId }).populate('user', 'name');
        return res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        return res.status(500).json({ success: false, err: err.message });
    }
};

module.exports = { addReview, getMovieReviews };
