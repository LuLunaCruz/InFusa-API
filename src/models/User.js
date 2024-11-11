const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const User = sequelize.define('users', {
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    first_name: {
        type: DataTypes.STRING(65),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(65),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
});

module.exports = User;