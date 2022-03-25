const bcrypt = require('bcrypt')
const Transformer = require('object-transformer')
const { Op } = require('sequelize')
const moment = require('moment')
const path = require('path')
const Response = require('../../handler/Response')
const Helper = require('../../utility/Helper')
const Mailer = require('../../lib/Mailer')
const Joi = require('@hapi/joi')
const jwToken = require('../../lib/jwtToken')
const {
    DELETE, SUCCESS, FAIL, ACTIVE,
    BAD_REQUEST, INTERNAL_SERVER,
    UN_VERIFY,CUSTOMER,HOST,PARTNER,
    MALE,FEMALE,OTHER,UNAUTHORIZED
} = require('../../utility/Constants')
const { User } = require('../../models')
module.exports = {
    /**
     * @description user login controller
     * @param req
     * @param res
     */
    login: async (req, res) => {
        const reqParam = req.body
        const reqObj = {
            email: Joi.string().required().email(),
            password: Joi.string().min(6).regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/).required()
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
            const user = await User.findOne({
                where: {
                    email: reqParam.email,
                    status: {
                        [Op.not]: DELETE,
                    },
                },
            }).then((customerData) => customerData)
            if (user) {
                if (user.status === ACTIVE) {
                    bcrypt.compare(
                        reqParam.password,
                        user.password,
                        async (err, result) => {
                            if (err) {
                                return Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__('emailPasswordNotMatch'),
                                    BAD_REQUEST
                                )
                            }
                            if (result) {
                                const token = jwToken.issueUser({
                                    id: user.id,
                                    user_role_type: user.user_role_type,
                                })
                                user.reset_token = token
                                User.update({reset_token: token}, {
                                    where: {
                                        email: user.email
                                    }
                                }).then(async (updateData) => {
                                    if (updateData) {
                                        console.log()
                                        return Response.successResponseData(
                                            res,
                                            user,
                                            SUCCESS,
                                            res.locals.__('loginSuccess'),
                                        )

                                    } else {
                                        return Response.errorResponseData(
                                            res,
                                            res.__('somethingWentWrong')
                                        )
                                    }
                                }, (e) => {
                                    console.log(e)
                                    Response.errorResponseData(
                                        res,
                                        res.__('internalError'),
                                        INTERNAL_SERVER
                                    )
                                })                            } else {
                                Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__('usernamePasswordNotMatch'),
                                    FAIL
                                )
                            }
                            return null
                        }
                    )
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('UserInActiveOrUnVerified'),
                        FAIL
                    )
                }
            } else {
                Response.errorResponseWithoutData(
                    res,
                    res.locals.__('UserNameNotExist'),
                    FAIL
                )
            }
        }
    },

    /**
     * @description user sign-up controller
     * @param req
     * @param res
     */
    signUp: async (req, res) => {
        const reqParam = req.fields
        const reqObj = {
            image: Joi.string().optional(),
            user_role_type: Joi.number().valid(CUSTOMER,HOST,PARTNER).required(),
            name: Joi.string().trim().max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().required().min(6).regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/).trim(),
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
        const schema = Joi.object(reqObj)
        const {error} = await schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('signUpValidation', error))
            )
        } else {
            let image;
            if (req.files.image && req.files.image.size > 0) {
                image = true;
                const extension = req.files.image.type;
                const imageExtArr = ['image/jpg', 'image/jpeg', 'image/png'];
                if (req.files && req.files.image && (!imageExtArr.includes(extension))) {
                    return Response.errorResponseData(res, res.__('imageInvalid'), BAD_REQUEST);
                }
            }
            const imageName = image ? `${moment().unix()}${path.extname(req.files.image.name)}` : '';

            if (reqParam.email && reqParam.email !== '') {
                const userEmailExist =  await User.findOne({
                    where: {
                        email: reqParam.email,
                        status: {
                            [Op.not]: DELETE,
                        },
                    },
                }).then((userEmailData) => userEmailData)

                if (userEmailExist) {
                    return Response.errorResponseWithoutData(
                        res,
                        res.locals.__('emailAddressIsAlreadyRegisteredWithUs'),
                        FAIL
                    )
                }
            }

            const userMobileExist = await User.findOne({
                where: {
                    contact_number: reqParam.contact_number,
                    status: {
                        [Op.not]: DELETE,
                    },
                },
            }).then((userMobileExistData) => userMobileExistData)

            if (userMobileExist) {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('mobileIsAlreadyRegisteredWithUs'),
                    FAIL
                )
            }
            try {
                const passwordHash = await bcrypt.hashSync(reqParam.password, 10);
                const userObj = {
                    profile_image: imageName,
                    name: reqParam.name,
                    user_role_type: reqParam.user_role_type,
                    contact_number: reqParam.contact_number,
                    email: reqParam.email,
                    password: passwordHash,
                    dob:reqParam.dob,
                    gender: reqParam.gender,
                    profession:reqParam.profession,
                    city:reqParam.city,
                    state:reqParam.state,
                    country:reqParam.country,
                    pin_code:reqParam.pin_code,
                    status: ACTIVE,
                }
                await User.create(userObj)
                    .then(async (result) => {
                        if (result) {
                            if (image) {
                                await Helper.UserImageUpload(req, res, imageName);
                            }
                            return Response.successResponseData(res,result, SUCCESS,res.locals.__('UserAddedSuccessfully'))
                        } else {
                            Response.errorResponseData(res, res.locals.__('globalError'), INTERNAL_SERVER);
                        }
                    }, (e) => {
                        Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            INTERNAL_SERVER
                        )
                    })
            }catch (e) {
                console.log(e)
                return Response.errorResponseData(res, res.__('somethingWentWrong'))
            }
        }
    },

    /**
     * @description user forgot password controller
     * @param req
     * @param res
     */
    forgotPassword: async (req, res) => {
        const reqParam = req.body;
        const schema = Joi.object({
            email: Joi.string().trim().email().max(150).required(),
        })
        const {error} = await schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('forgotPasswordValidation', error))
            )
        } else {
            User.findOne({
                where: {
                    email: reqParam.email.toLowerCase(),
                    status: {
                        [Op.not]: DELETE
                    }
                }
            }).then(async (user) => {
                if (user) {
                    const verificationCode = await Helper.hashstring(7);
                    const minuteLater = new Date();
                    const resetPasswordExpTime = minuteLater.setMinutes(minuteLater.getMinutes() + 20);
                    const reqObj = {
                        verification_link: verificationCode,
                        password_reset_token_expire_at: resetPasswordExpTime
                    };
                    User.update(reqObj,{
                        where:{
                            id: user.id
                        }
                    }).then(async (updatedUser) => {
                        if (!updatedUser) {
                            Response.errorResponseData(res, res.locals.__('accountIsInactive'), BAD_REQUEST);
                        } else {
                            const locals = {
                                username: user.name,
                                appName: Helper.AppName,
                                verification_code: verificationCode,
                                link: `${process.env.APP_URL}/reset-password?email=${user.email}&token=${verificationCode}`
                            };
                            try {
                                await Mailer.sendMail(reqParam.email, 'forgotPassword', Helper.forgotTemplate, locals);
                                Response.successResponseWithoutData(res,res.locals.__('forgotPasswordEmailSendSuccess'),SUCCESS);
                            } catch (e) {
                                console.log(e);
                                Response.errorResponseData(res, e.message, INTERNAL_SERVER);
                            }
                        }
                    }, () => {
                        Response.errorResponseData(res, res.__('internalError'), INTERNAL_SERVER);
                    });
                } else {
                    Response.successResponseWithoutData(res, res.locals.__('emailNotExist'), FAIL);
                }
                // eslint-disable-next-line no-unused-vars
            }, (err) => {
                Response.errorResponseData(res, res.__('internalError'), INTERNAL_SERVER);
            });
        }
    },

    /**
     * @description user reset password controller
     * @param req
     * @param res
     */
    resetPassword: async (req, res) => {
        const reqParam = req.body;
        const schema = Joi.object({
            email: Joi.string().trim().required().email(),
            token: Joi.string().trim().required(),
            password: Joi.string()
                .min(6).trim()
                .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
                .required()
        });
        const {error} = schema.validate(reqParam);
        if (error) {
            Response.validationErrorResponseData(res, res.__(Helper.validationMessageKey('resetPasswordValidation', error)));
        }
        else {
            // eslint-disable-next-line camelcase
            const hash = await bcrypt.hashSync(reqParam.password, 10);
            User.findOne({
                where: {
                    verification_link: reqParam.token,
                    email: reqParam.email,
                    status:
                        {
                            [Op.not]: DELETE
                        }
                }
            }).then((user) => {
                if (user) {
                    const updateObj = {
                        password: hash,
                        verification_link: ''
                    }
                    User.update(updateObj, {
                        where:{
                            id:user.id
                        }
                    }).then((updated) => {
                        if (updated) {
                            Response.successResponseWithoutData(res, res.__('passwordResetSuccessfully'),SUCCESS);
                        } else {
                            Response.successResponseWithoutData(res, res.__('resetPasswordFailed'), FAIL);
                        }
                        // eslint-disable-next-line no-unused-vars
                    }, (err) => {
                        Response.errorResponseData(res, res.__('internalError'), INTERNAL_SERVER);
                    });
                } else {
                    Response.successResponseWithoutData(res, res.locals.__('invalidVerificationCode'), FAIL);
                }
            }, () => {
                Response.errorResponseData(res, res.__('internalError'), INTERNAL_SERVER);
            });
        }
    },

    /**
     * @description Social Login
     * @param req
     * @param res
     */
    socialLogin: async(req, res) => {
        const reqParam = req.body
        const reqObj = {
            user_role_type: Joi.string().optional(),
            sign_up_type: Joi.number().required(),
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            social_id: Joi.string().required(),
            image: Joi.string().optional(),
        }

        const schema = Joi.object(reqObj)
        const { error } = await schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('LoginValidation', error))
            )
        } else {
            console.log(reqParam.social_id)
            User.findOne({
                where: {
                    social_id: reqParam.social_id,
                    status: {
                        [Op.ne]: DELETE,
                    },
                },
            }).then(async(user) => {
                if (user) {
                    if (reqParam.email && reqParam.email !== '') {
                        const userEmailExist = await User.findOne({
                            where: {
                                email: reqParam.email,
                                status: {
                                    [Op.not]: DELETE,
                                },
                            },
                        }).then((userEmailData) => userEmailData)

                        if (userEmailExist) {
                            return Response.errorResponseWithoutData(
                                res,
                                res.locals.__('emailAddressIsAlreadyRegisteredWithUs'),
                                FAIL
                            )
                        }
                    }
                    const token = jwToken.issueUser({
                        id: user.id,
                        user_role_type: user.user_role_type,
                    })
                    user.reset_token = token
                    if (user.social_id === reqParam.social_id) {
                        if (user.status === ACTIVE) {
                            User.update({reset_token: token}, {
                                where: {social_id: reqParam.social_id},
                            }).then(async (updateData) => {
                                if (updateData) {
                                    // const meta = {token: jwToken.issueUser(user.id)}
                                    return Response.successResponseData(
                                        res,
                                        user,
                                        SUCCESS,
                                        res.locals.__('loginSuccess'),
                                    )

                                } else {
                                    return Response.errorResponseData(
                                        res,
                                        res.__('somethingWentWrong')
                                    )
                                }
                            }, (e) => {
                                Response.errorResponseData(
                                    res,
                                    res.__('internalError'),
                                    INTERNAL_SERVER
                                )
                            })
                        } else {
                            Response.errorResponseWithoutData(
                                res,
                                res.locals.__('accountIsInactive'),
                                UNAUTHORIZED
                            )
                        }
                    }
                     } else {
                    //     const updateObj = {
                    //         social_id: reqParam.social_id,
                    //         sign_up_type: reqParam.sign_up_type,
                    //         reset_token: token
                    //     }
                    //     User.update(updateObj, {
                    //         where: { social_id: reqParam.social_id },
                    //     }).then(async(updateData) => {
                    //         if (updateData) {
                    //             var data = {
                    //                 id: user.id,
                    //                 email: user.email,
                    //                 token: token

                    //             }
                    //             return Response.successResponseData(
                    //                 res,
                    //                 data,
                    //                 SUCCESS,
                    //                 res.locals.__('loginSuccess')
                    //             )
                    //
                    //         } else {
                    //             return Response.errorResponseData(
                    //                 res,
                    //                 res.__('somethingWentWrong')
                    //             )
                    //         }
                    //     }, (e) => {
                    //         Response.errorResponseData(
                    //             res,
                    //             res.__('internalError'),
                    //             INTERNAL_SERVER
                    //         )
                    //     })
                    //
                    return Response.errorResponseWithoutData(
                        res,
                        res.locals.__('userNotAvailable'),
                        FAIL
                    )
                }

            }, (e) => {
                Response.errorResponseData(
                    res,
                    res.__('internalError'),
                    INTERNAL_SERVER
                )
            })
        }
    },

}