const jwt = require('jsonwebtoken');
const jwt_token_secret_string = "qfehfqeilfudff5heziufzqqlbfbvlqfqdf3qd"

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwt_token_secret_string); //decodage du Token 
    const { userId } = decodedToken;
    if (!userId) {
      throw 'Merci de vous connecter';
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error | 'Requête non authentifiée ! ' });
  }
};