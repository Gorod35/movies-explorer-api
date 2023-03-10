const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const NotAutorizedError = require('../errors/not-authorized-err');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Указан некорретный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new NotAutorizedError('Неправильный логин или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new NotAutorizedError('Неправильный логин или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
