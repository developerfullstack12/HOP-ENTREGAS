const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const connect = require('connect')
const { apiTokenAuth } = require('../../middlewares/api')
const AuthController = require('../../controllers/api/AuthController')
const NotificationController = require('../../controllers/api/NotificationController')
const UserController = require('../../controllers/api/UserController')
const PropertyController = require('../../controllers/api/PropertyController')
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
router.post('/edit-profile',authMiddleware, UserController.editProfile)

//property

router.get('/user-property-list', apiTokenAuth, PropertyController.UserPropertyList);
router.get('/property-list', apiTokenAuth, PropertyController.PropertyList);
router.post('/add-property', apiTokenAuth,formidableMiddleware({ multiples: true }), PropertyController.AddProperty);
router.post('/edit-property', authMiddleware, PropertyController.EditPropertyDetail);
router.delete('/delete-property/:id', apiTokenAuth, PropertyController.deleteProperty);

module.exports = router