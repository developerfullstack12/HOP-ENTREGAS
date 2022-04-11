const { Op } = require('sequelize')
const Response = require('../../handler/Response')
const Helper = require('../../utility/Helper')
const { User } = require('../../models')
const Joi = require('@hapi/joi')
const jwToken = require('../../lib/jwtToken')
const {
    DELETE, SUCCESS, FAIL, ACTIVE,
    BAD_REQUEST, INTERNAL_SERVER,
    UN_VERIFY,CUSTOMER,HOST,PARTNER,
    MALE,FEMALE,OTHER,UNAUTHORIZED,USER_IMAGE
} = require('../../utility/Constants')
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
                const profilePicture = (userData.profile_image) && userData.profile_image !== '' ? userData.profile_image : '';
                userData.profile_image = await Helper.mediaUrl(USER_IMAGE, profilePicture);
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
},

    /**
     * @description Edit Profile
     * @param req
     * @param res
     */
    editProfile: async(req, res) => {
        const reqParam = req.fields;
        const { authUserId } = req
        let promise = [];
        let image;
        let resume;
        //const DB_DATE_FORMAT = 'DD-MM-YYYY';
        const requestObj = {
            image: Joi.string().optional(),
            user_role_type: Joi.number().valid(CUSTOMER,HOST,PARTNER).required(),
            name: Joi.string().trim().max(50).required(),
            email: Joi.string().email().required(),
            contact_number: Joi.string()
                .trim()
                .min(10)
                .max(10)
                .regex(/^[0-9]*$/)
                .required(),
            dob:Joi.date().required(),
            gender: Joi.number().valid(MALE,FEMALE,OTHER).required(),
            profession:Joi.string().required(),
            city:Joi.string().trim().required(),
            state:Joi.string().trim().required(),
            country:Joi.string().trim().required(),
            pin_code: Joi.string()
                .trim()
                .regex(/^[0-9]*$/)
                .required()
        }
        // const newData = moment(reqParam.dob).format(DB_DATE_FORMAT);
        const schema = Joi.object(requestObj)
        const { error } = schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('editProfileValidation', error))
            )
        } else {
            await User.findOne({
                where: {
                    id: authUserId,
                    status: {
                        [Op.not]: DELETE,
                    }
                },
            })
                // eslint-disable-next-line consistent-return
                .then(async(userData) => {
                    if (userData) {
                        console.log("errro of image");
                        if (req.files.image && req.files.image.size > 0) {
                            image = true;
                            const extension = req.files.image.type;
                            const imageExtArr = ['image/jpg', 'image/jpeg', 'image/png'];
                            if (req.files && req.files.image && (!imageExtArr.includes(extension))) {
                                return Response.errorResponseData(res, res.__('imageInvalid'), BAD_REQUEST);
                            }
                        }
                        const imageName = image ? `${moment().unix()}${path.extname(req.files.image.name)}` : '';
                        const userObj = {
                            profile_image: imageName,
                            name: reqParam.name,
                            user_role_type: reqParam.user_role_type,
                            contact_number: reqParam.contact_number,
                            email: reqParam.email,
                            dob:reqParam.dob,
                            gender: reqParam.gender,
                            profession:reqParam.profession,
                            city:reqParam.city,
                            state:reqParam.state,
                            country:reqParam.country,
                            pin_code:reqParam.pin_code,
                            status: ACTIVE,
                        }
                        User.update(updateObj, {
                            where: { id: userData.id },
                        }).then(async(updateData, err) => {
                            if (updateData) {
                                 const responseData = await User.findByPk(userData.id, { include: arr })
                                    // responseData.image = Helper.mediaUrl(
                                    //     USER_IMAGE,
                                    //     responseData.profile_image
                                    // )
                                    return Response.successResponseData(
                                        res,
                                        //new Transformer.Single(responseData, edit_profile).parse(),
                                        responseData,
                                        SUCCESS,
                                        res.locals.__('userProfileUpdateSuccess')
                                    )
                            } else {
                                return Response.errorResponseData(
                                    res,
                                    res.__('somethingWentWrong')
                                )
                            }
                        })
                    } else {
                        return Response.successResponseWithoutData(
                            res,
                            res.locals.__('userNotAvailable')
                        )
                    }
                })
                .catch((e) => {
                    console.log(e)
                    return Response.errorResponseData(res, res.__('somethingWentWrong'))
                })
        }
    },
}
