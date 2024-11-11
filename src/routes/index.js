const express = require('express');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const router = express.Router();

router.use("/usuarios", userRouter)
router.use("/publicaciones", postRouter)

module.exports = router;