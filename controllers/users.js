const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const AlreadyExistsError = require('../errors/already-exists-err');

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  return User.findById(userId)
    .orFail(() => next(new NotFoundError('Пользователь с указанным _id не найден.')))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => next(new BadRequestError('Пользователь с указанным _id не найден.')))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } else if (err.code === 11000) {
        next(new AlreadyExistsError('Такой e-mail уже существует.'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    }))
    .then((user) => res.status(200).send({
      email: user.email,
      name: user.name,
      _id: user._id,
    }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }
      if (err.code === 11000) {
        return next(new AlreadyExistsError('Такой email уже существует.'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => next(err));
};

module.exports = {
  getUserInfo, updateUser, createUser, login,
};
