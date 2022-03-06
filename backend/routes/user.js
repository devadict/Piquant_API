const express = require('express');
const expressBouncer = require('express-bouncer')(5000, 600000, 3);

const router = express.Router();
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', expressBouncer.block, userCtrl.login); //mitiger les attaques "brutes forces"

module.exports = router;