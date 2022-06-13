const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // .split(' ')[1] retourne la deuxième partie de l'autorisation et pas le bearer "bearer xxxxxxx"
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable !';
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée !' });
    }
}
