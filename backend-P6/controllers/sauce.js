const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    sauceObject.likes = 0;
    sauceObject.dislikes = 0;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};
    if (req.file) {
        Sauce.findOne({_id: req.params.id})
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                })
            })
    }
    delete req.body._id;
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id}).then(
        () => {
            res.status(201).json({
                message: 'Sauce updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(
                        () => {
                            res.status(200).json({
                                message: 'Deleted!'
                            });
                        }
                    )
                    .catch(
                        (error) => {
                            res.status(400).json({
                                error: error
                            });
                        }
                    );
            })
        })
        .catch(error => res.status(500).json({error}))
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

/*
//         Récupérer la sauce
//         si ça ne marche pas -> erreur
//         sinon :
//             si un like (req.body.like === 1) est demandé :
//                 si l'userid est dans le tableau des userID => erreur
//                 sinon => ajouter l'userid dans le tableau et like +1 sur la sauce
//             si un dislike (req.body.like === -1) est demandé :
//                 si l'userid est dans le tableau des userid => erreur
//                 sinon => ajouter l'userid dans le tableau des dislikes et dislike +1
//             si une annulation est demandée (req.body.like === 0) :
//                 si l'user avait liké la sauce : on fait like -1 et on enlève son userid du tableau des likes
//                 si l'user avait disliké la sauce : on fait dislike -1 et on enlève son userid du tableau des dislikes
//
//         enregistrer la sauce à la fin : sauce.save();
//     */

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then((sauce) => {
        // Quand on souhaite un like :
        if (req.body.like === 1) {
            if (sauce.usersLiked.includes(req.body.userId)) {
                res.status(400).json({
                    error: 'Sauce already liked'
                });
            } else {
                sauce.usersLiked.push(req.body.userId)
                sauce.likes ++
            }
        // Quand on souhaite un dislike :
        } else if (req.body.like === -1) {
            if (sauce.usersDisliked.includes(req.body.userId)) {
                res.status(400).json({
                    error: 'Sauce already disliked'
                });
            } else {
                sauce.usersDisliked.push(req.body.userId)
                sauce.dislikes ++
            }
        // Quand on souhaite annuler son like ou dislike :
        } else if (req.body.like === 0) {
            if (sauce.usersLiked.includes(req.body.userId)) {
                sauce.usersLiked.remove(req.body.userId)
                sauce.likes--
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
                sauce.usersDisliked.remove(req.body.userId)
                sauce.dislikes--
            }
        }
        sauce.save().then(
            () => {
                res.status(201).json({
                    message: "Sauce Like Updated!"
                });
            }
        ).catch(
            (error) => {
                res.status(400).json({
                    error: error
                });
            }
        );
    });
};
