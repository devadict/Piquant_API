const fs = require('fs');//Node file system pour accéder au fichier de système
const Sauce = require('../models/Sauce'); 
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce); //on parse la chaine de caractère
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename}`,
  });
  sauce
    .save()//Enregistrer Sauce dans la BDD 
    .then(() => res.status(201).json({ message : `Vous venez de créer la sauce ${sauce}` }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res) => {
  const sauceObject = req.file
    ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename}`, 
    } 
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id },
  )
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id }) //Trouver la sauce en question
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => { // Pour effacer le fichier//
        Sauce.deleteOne({ _id: req.params.id }) // Supprimer le fichier de la BDD//
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res) => {
  switch (req.body.like) { 
    case 0: 
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
 /* Verifier si l'utilisateur like la Sauce */  if (sauce.usersLiked.find((user) => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id,
              }, //On retire le like de l'utilisateur
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: 'Votre like a été retiré' });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
            /* On vérifie si l'utilisateur dislike la sauce*/ if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
                _id: req.params.id,
              },
            ) /* Retrait du dislike */
              .then(() => {
                res
                  .status(201)
                  .json({ message: 'Votre dislike a été retiré' });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
        })
        .catch((error) => {
          res.status(404).json({ error });
        });
      break;
    case 1: /* Lorsqu'aucun dislike n'a été ajouté */
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId },
          _id: req.params.id,
        },
      )
        .then(() => {
          res.status(201).json({ message: 'Votre like a été pris en compte!' });
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
      break; 
    case -1: /* Lorque qu'aucun dislike n'a été ajouté */
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId },
          _id: req.params.id,
        }, /* On ajoute le dislike */
      )
        .then(() => {
          res
            .status(201)
            .json({ message: 'Votre dislike a été pris en compte!' });
        })
        .catch((error) => {
          res.status(400).json({ error });
        }); 
      break;
    default:
      console.error('Bad request, réessayez plus tard');
  }
};