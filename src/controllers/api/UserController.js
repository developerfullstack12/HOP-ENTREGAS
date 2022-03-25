const { Op } = require('sequelize')
const Response = require('../../handler/Response')
const {
    DELETE
} = require('../../utility/Constants')
const { User } = require('../../models')
module.exports = {
/**
 * @description My Profile
 * @param req
 * @param res
 */
myProfile: async(req, res) => {
    const {authUserId} = req
    await User.findOne({
        where: {
            id: authUserId,
            status: {
                [Op.not]: DELETE,
            }
        }
    })
        .then(async (userData) => {
            if (userData) {
                return Response.successResponseData(
                    res,
                    userData,
                    res.locals.__('success')
                )
            } else {
                return Response.successResponseWithoutData(
                    res,
                    res.locals.__('UserNotAvailable')
                )
            }
        })
        .catch((e) => {
            console.log(e)
            return Response.errorResponseData(res, res.__('somethingWentWrong'))
        })
}
}
