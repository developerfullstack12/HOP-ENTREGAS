const { Op } = require('sequelize')
const Response = require('../../handler/Response')
const Helper = require('../../utility/Helper')
const notication = require('../../lib/notification')
const Joi = require('@hapi/joi')
const {
    SUCCESS,
    INTERNAL_SERVER,
    ACTIVE,
} = require('../../utility/Constants')
const { User,Notification } = require('../../models')
module.exports = {

    /**
     * @description 'Accept or Reject user job application '
     * @param req
     * @param res
     */
    SendNotification: async (req, res) => {
        const requestParams = req.body
        const {authUserId} = req
        const reqParam = req.body
        const reqObj = {
            message: Joi.string().max(1000).required()
        }
        const schema = Joi.object(reqObj)
        const {error} = await schema.validate(reqParam)
        if (error) {
            console.log(error)
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('LoginValidation', error))
            )
        } else {
            let notification_data = {
                title: 'HOP ENTREGAS!',
                message: requestParams.message,
                sender_id: 1,//authUserId,
                receiver_id: 1,//requestParams.receiver_id,
                status: ACTIVE
            }
            const userData = await User.findByPk(1);
            if (userData.fcm_token !== null || userData.fcm_token !== '') {
                await Notification.create(notification_data).then(async (result) => {
                    if (result) {
                        const not = await notication.pushNotification(notification_data, userData.fcm_token)
                        console.log(not)
                    }
                }).catch((e) => {
                    console.log(e)
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        INTERNAL_SERVER
                    )
                })
            }
        }
    }
}