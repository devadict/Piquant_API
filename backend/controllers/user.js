const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passwordValidator = require('password-validator');
const jwt_token_secret_string = "qfehfqeilfudff5heziufzqqlbfbvlqfqdf3qd" //Chaine secrète développoement temporaire encodage token

var schema = new passwordValidator();

schema
.is().min(8) //Le mot de passe doit avoir un minimum de 8 caractères                             
.is().max(100) // Le mdp doit avoir un maximum de 100 caractères
.has().uppercase() // Le mdp doit contenir 1 minuscule                             
.has().lowercase() // Le mdp doit contenir 1 majuscule
.has().digits()    // Le mdp doit contenir des chiffres
.has().not().spaces() // Le mdp ne doit pas contenir d'espaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Le mdp ne doit pas être un des mots de passe pré-cités

exports.signup = (req, res) => {
  if (!schema.validate(req.body.password)){ // Si schéma correspond pas alors -> error //
    res.status(401).json({
      error: Error.message = 'Schéma incorrect ! '
    }); 
  } else if (schema.validate(req.body.password)) { //Schéma validé
    bcrypt.hash(req.body.password, 10) // Hashage 10 fois du mot de passe
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch((error) => res.status(400).json({ message: 'utilisateur existant! essayez de vous connecter' }));
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé ! ' });
      }
      bcrypt.compare(req.body.password, user.password) //Comparaison entre bcrypt et le hash,
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect ! ' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, jwt_token_secret_string, { //Encodage du nouveau token
              expiresIn: '24h', //Validité 24h
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};