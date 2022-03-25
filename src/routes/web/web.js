const express = require('express'),
  router = express.Router();
const { userResetPasswordPage, userResetPasswordAction } = require('../../controllers/web/WebController');

router.get('/reset-password', userResetPasswordPage);
router.post('/reset-password', userResetPasswordAction);


module.exports = router;
