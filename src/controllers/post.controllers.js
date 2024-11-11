const Post = require('../models/Post');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const getAll = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: User
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener las publicaciones', error });
    }
};

const create = async (req, res) => {
    try {
        const { description, location, latitude, longitude } = req.body;
        const post = await Post.create({
            userId: req.user.id,
            description,
            location,
            latitude,
            longitude
        });
        const user = await User.findByPk(req.user.id);
        if (user) {
            await sendEmail({
                to: `${user.email}`,
                subject: `Publicación Infusa realizada exitosamente`,
                html: ` 
                <h1>Hola ${user.first_name} ${user.last_name}</h1>
                <p>Tu publicación ha sido recibida y será atendida</p>
                <p>Gracias por usar InFusa</p>
                `
            });
        }
        return res.status(201).json(post);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear la publicación', error });
    }
};

const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: User
        });
        if (!post) return res.sendStatus(404);
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener la publicacion', error });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: User,
        });
        const deleted = await Post.destroy({ where: { id } });
        if (!deleted) return res.sendStatus(404);
        await sendEmail({
            to: post.user.email,
            subject: "Eliminación de publicación en InFusa",
            html: ` 
            <h1>Hola ${post.user.first_name} ${post.user.last_name}</h1>
            <p>Tu siguiente publicación ha sido eliminada, serás notificado en los proximos dias por la razón de su eliminación</p>
            <p>${post.description}, ${post.location}</p>

            <p>Gracias por usar InFusa</p>            `
        })
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar la publicacion', error });
    }
};

const getPostsByLocation = async (req, res) => {
    try {
        const location = req.params.location;
        const posts = await Post.findAll({
            where: { location },
            include: [{ model: User }]
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener posts', error });
    }
}

module.exports = {
    getAll,
    create,
    getOne,
    getPostsByLocation,
    remove,
};