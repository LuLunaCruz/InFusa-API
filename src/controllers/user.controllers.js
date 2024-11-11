const catchError = require('../utils/catchError');
const User = require('../models/User');
const Post = require('../models/Post');
const EmailCode = require('../models/EmailCode');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const getAll = catchError(async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Post
            }]
        });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener los usuarios.", error });
    }
});

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, phone, email, password, birthday } = req.body;
        // Encriptar contraseña
        const encryptedPassword = await bcrypt.hash(password, 10);
        // Crear usuario
        const user = await User.create({
            first_name,
            last_name,
            phone,
            email,
            password: encryptedPassword,
            birthday
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { first_name, last_name, phone, email, password, birthday } = req.body;
        // Encriptar contraseña
        const encryptedPassword = await bcrypt.hash(password, 10);
        // Crear administrador
        const admin = await User.create({
            is_admin: true,
            first_name,
            last_name,
            phone,
            email,
            password: encryptedPassword,
            birthday
        });
        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear administrador', error });
    }
};

const getOne = catchError(async(req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByPk(id, {
            include: Post
        });
        if(!user) return res.sendStatus(404);
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
});

const remove = catchError(async (req, res) => {
    try {        
        const { id } = req.params;
        const user = await User.findByPk(id);
        const deleted = await User.destroy({ where: { id } });
        if (!deleted) return res.sendStatus(404);
        await sendEmail({
            to: user.email,
            subject: "Eliminación de cuenta InFusa",
            html: ` 
            <h1>Hola ${user.first_name} ${user.last_name}</h1>
            <p>Tu cuenta ha sido eliminada</p>
            `
        })
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
});

const update = catchError(async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone, birthday } = req.body;
        const [updatedRows, updatedUser] = await User.update(
            { first_name, last_name, phone, birthday },
            { where: { id }, returning: true }
        );
        if (updatedRows === 0) return res.sendStatus(404);
        return res.json(updatedUser[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Error al editar el usuario', error });
    }
});

const login = catchError(async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const token = jwt.sign(
            {user},
            process.env.TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        return res.json({ user, token });
    } catch (error) {
        return res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
});

const resetPasswordEmail = catchError(async(req, res) => {
    const { email, frontBaseUrl } = req.body;
    const user = await User.findOne({where: {email}});
    if(!user){
        return res.status(401).json({ message: "Credenciales inválidas"});
    }else{
        const code = require('crypto').randomBytes(32).toString("hex");
        const link = `${frontBaseUrl}/auth/reset_password/${code}`;
        await EmailCode.create({
            code,
            userId: user.id
        });
        await sendEmail({
            to: email,
            subject: 'Restablecer contraseña InFusa',
            html: `
            <h1>Hola ${user.first_name} ${user.last_name}!</h1>
            <p>Restablece tu contraseña haciendo click en el siguiente enlace</p>
            <a href="${link}">${link}</a>
            <p><b>Gracias por usar InFusa</b></p>
            `
        });
        return res.sendStatus(201);
    }
});

const resetPassword = catchError(async(req, res) => {
    const { code } = req.params;
    const { password } = req.body;
    const emailCode = await EmailCode.findOne({where: {code}});
    if(!emailCode){
        return res.status(401).json({ message: "Código inválido"});
    }else{
        const user = await User.findByPk(emailCode.userId);
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        await emailCode.destroy();
        await sendEmail({
            to: user.email,
            subject: 'Contraseña cambiada con éxito',
            html: `
            <h1>Hola ${user.first_name} ${user.last_name}!</h1>
            <p>Tu contraseña de InFusa ha sido cambiada exitosamente</p>
            <p><b>Gracias por usar InFusa</b></p>
            `
        });
        return res.json(user);
    }
});

module.exports = {
    getAll,
    createUser,
    createAdmin,
    getOne,
    remove,
    update,
    login,
    resetPasswordEmail,
    resetPassword
}