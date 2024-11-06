var express = require('express');
var router = express.Router();
const authMiddleware = require('../../middlewares/api/authMiddleware')
var postcontroller = require('../../controllers/api/postcontroller');

router.get('/', authMiddleware, postcontroller.getpost)
router.post('/pushpost', authMiddleware, postcontroller.pushpost);


module.exports = router;