const Movie = require('../models/movie');

const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const NotOwnerError = require('../errors/not-owner-err');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies.reverse()))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Неверно указаны данные фильма.'));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => next(new NotFoundError('Фильм не найден.')))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        next(new NotOwnerError('Ошибка доступа.'));
      } else {
        movie.remove()
          .then(() => res.send({ message: movie }))
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Неверно указан id фильма.'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
