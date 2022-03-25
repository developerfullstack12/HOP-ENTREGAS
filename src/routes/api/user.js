const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const connect = require('connect')
const { apiTokenAuth } = require('../../middlewares/api')
const AuthController = require('../../controllers/api/AuthController')
const NotificationController = require('../../controllers/api/NotificationController')
const UserController = require('../../controllers/api/UserController')
const authMiddleware = (() => {
    const chain = connect();
    [formidableMiddleware(), apiTokenAuth].forEach((middleware) => {
        chain.use(middleware)
    })
    return chain
})()

//user LRF
router.post('/login', AuthController.login)
router.post('/social-login', AuthController.socialLogin)
router.post('/sign-up',formidableMiddleware(), AuthController.signUp)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)
router.post('/notification', NotificationController.SendNotification)

//profile
router.get('/my-profile',apiTokenAuth, UserController.myProfile)

module.exports = router