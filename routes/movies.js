const movieRouter = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

const {
  validateCreateMovie,
  validateDeleteMovie,
} = require('../middlewares/validations');

const auth = require('../middlewares/auth');

movieRouter.use(auth);
movieRouter.get('/', getMovies);
movieRouter.post('/', validateCreateMovie, createMovie);
movieRouter.delete('/:movieId', validateDeleteMovie, deleteMovie);

module.exports = movieRouter;
