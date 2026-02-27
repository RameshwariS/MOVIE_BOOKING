const express = require('express');
const router = express.Router();
const { addReview, getMovieReviews } = require('../controllers/review.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, addReview);
router.get('/:movieId', getMovieReviews);

module.exports = router;
