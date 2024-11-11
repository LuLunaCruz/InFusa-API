const express = require('express');
const { getAll, getOne, remove, update, login, createUser, createAdmin, resetPasswordEmail, resetPassword } = require('../controllers/user.controllers');
const verifyAdmin = require('../utils/verifyAdmin');

const userRouter = express.Router();

userRouter.route('/')
    .get(getAll)
    .post(createUser)

userRouter.route('/login')
    .post(login)

userRouter.route('/:id')
        .get(getOne)
        .put(update)
        .delete(verifyAdmin, remove)

userRouter.route('/reset_password')
    .post(resetPasswordEmail)
    
userRouter.route('/reset_password/:code')
    .post(resetPassword)

userRouter.route('/admin')
    .post(createAdmin)

module.exports = userRouter;