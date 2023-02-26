const userRouter = require('express').Router();
const {
  getUserInfo, updateUser,
} = require('../controllers/users');
const { validateUpdateUser } = require('../middlewares/validations');
const auth = require('../middlewares/auth');

userRouter.use(auth);
userRouter.get('/me', getUserInfo);
userRouter.patch('/me', validateUpdateUser, updateUser);

module.exports = userRouter;
