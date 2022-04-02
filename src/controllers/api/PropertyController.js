const { Op } = require('sequelize')
const Response = require('../../handler/Response')
const Helper = require('../../utility/Helper')
const { Property } = require('../../models')
const Joi = require('@hapi/joi')
const {
    SUCCESS,
    FAIL,YES,NO,
    INTERNAL_SERVER,
    DELETE,PER_PAGE,MONTH,DAYS,MONTHLY,ANNUAL,
    ACTIVE,BAD_REQUEST
} = require('../../utility/Constants')


/**
 * @description 'This function is use to user property list'
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

module.exports = {
    UserPropertyList: async (req, res) => {
        const {authUserId} = req
        await Property.findOne({
            where:{
                user_id:authUserId,
                status: {
                    [Op.not]: DELETE,
                }
            }
        }).then((data) => {
            if (data) {
                return Response.successResponseData(
                    res,
                    data,
                    SUCCESS,
                    res.locals.__('success'),
                )
            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('noDataFound'),
                    FAIL
                )
            }
        }, () => {
            Response.errorResponseData(
                res,
                res.__('internalError'),
                INTERNAL_SERVER
            )
        })
    },

    /**
     * @description 'This function is use to add property'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */

    AddProperty: async (req, res) => {
        const reqParam = req.body;
        const {authUserId} = req
        const requestObj = {
            address:Joi.string().required().trim(),
            category:Joi.string().required().trim(),
            latitude:Joi.number().required(),
            longitude:Joi.number().required(),
            price:Joi.number().required(),
            description:Joi.string().required()
        }
        const schema = Joi.object(requestObj)
        const {error} = schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('addPropertyValidation', error))
            )
        } else {
            const WorkExpObj = {
                user_id:authUserId,
                address:reqParam.address,
                category:reqParam.category,
                latitude:reqParam.latitude,
                longitude:reqParam.longitude,
                price:reqParam.price,
                description:reqParam.description,
                status: ACTIVE
            }
            await Property.create(WorkExpObj)
                .then(async (result) => {
                    if (result) {
                        Response.successResponseData(
                            res,
                            result,
                            res.__('PropertyAdded')
                        )
                    }
                }).catch(async (e) => {
                    console.log(e)
                    Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        INTERNAL_SERVER
                    )
                })
        }
    },
    /**
     * @description 'This function is use to edit property detail.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */

    EditPropertyDetail: async (req, res) => {
        const reqParam = req.fields;
        const {authUserId} = req
        const requestObj = {
            id:Joi.number().required(),
            address:Joi.string().required().trim(),
            category:Joi.string().required().trim(),
            latitude:Joi.number().required(),
            longitude:Joi.number().required(),
            price:Joi.number().required(),
            description:Joi.string().required()
        }
        const schema = Joi.object(requestObj)
        const {error} = schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('editPropertyValidation', error))
            )
        } else {
            await Property.findOne({
                where: {
                    id: reqParam.id,
                    user_id:authUserId
                },
            }).then(async (Data) => {
                if (Data) {
                    const ProObj = {
                        address:reqParam.address,
                        category:reqParam.category,
                        latitude:reqParam.latitude,
                        longitude:reqParam.longitude,
                        price:reqParam.price,
                        description:reqParam.description,
                    }
                    Property.update(ProObj, {
                        where: {
                            id: reqParam.id,
                            user_id: authUserId,
                            status: ACTIVE
                        },
                    }).then(async (updateData, err) => {
                        if (updateData) {
                            const workData = await Property.findByPk(reqParam.id);
                            return Response.successResponseData(
                                res,
                                workData,
                                SUCCESS,
                                res.locals.__('propertyUpdateSuccess')
                            )
                        } else {
                            return Response.successResponseWithoutData(
                                res,
                                res.locals.__('propertyNotFound')
                            )
                        }
                    }).catch((e) => {
                        return Response.errorResponseData(res, res.__('somethingWentWrong'))
                    })
                } else {
                    return Response.successResponseWithoutData(
                        res,
                        res.locals.__('propertyNotAvailable')
                    )
                }
            }).catch((e) => {
                Response.errorResponseData(
                    res,
                    res.__('internalError'),
                    INTERNAL_SERVER
                )
            })
        }
    },
    /**
     * @description delete single property
     * @param req
     * @param res
     * */
    deleteProperty: async (req, res) => {
        const requestParam = req.params
        const propertyData = await Property.findByPk(requestParam.id)
        if (propertyData === null) {
            Response.successResponseWithoutData(
                res,
                res.__('noDataFound'),
                FAIL
            )
        } else {
            propertyData.status = DELETE
            propertyData.save()
                .then(() => {
                    Response.successResponseWithoutData(
                        res,
                        res.__('propertyDeleted'),
                        SUCCESS
                    )
                })
                .catch(() => {
                    Response.errorResponseData(
                        res,
                        res.__('somethingWentWrong'),
                        BAD_REQUEST
                    )
                })
        }
    },
}