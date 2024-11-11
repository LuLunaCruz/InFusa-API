const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');
const User = require('./User');

const Post = sequelize.define('posts', {
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL,
        allowNull: false
    }
    // userId
});

Post.belongsTo(User)
User.hasMany(Post)

module.exports = Post;