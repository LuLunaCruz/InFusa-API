const { getAll, create, remove, getOne, getPostsByLocation } = require('../controllers/post.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');
const verifyAdmin = require('../utils/verifyAdmin');

const postRouter = express.Router();

postRouter.route('/')
    .get(getAll)
    .post(verifyJWT, create)

postRouter.route('/:id')
    .get(getOne)
    .delete(verifyAdmin, remove)

postRouter.route('/ubicacion/:location')
    .get(getPostsByLocation)

module.exports = postRouter;