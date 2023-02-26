const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const NotFoundError = require('../errors/not-found-err');
const { createUser, login } = require('../controllers/users');
const { validateCreateUser, validateLogin } = require('../middlewares/validations');
const auth = require('../middlewares/auth');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLogin, login);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use(auth);
router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
