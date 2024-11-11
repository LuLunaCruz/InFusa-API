const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');
const User = require('./User');

const EmailCode = sequelize.define('emailCodes', {
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    //userId
});

EmailCode.belongsTo(User);
User.hasOne(EmailCode);

module.exports = EmailCode;