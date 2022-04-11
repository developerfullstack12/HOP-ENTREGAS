const { Op } = require('sequelize')
const Response = require('../../handler/Response')
const Helper = require('../../utility/Helper')
const moment = require('moment')
const path = require('path')
const { Property,Property_view } = require('../   ../models')
const Joi = require('@hapi/joi')
const {
    SUCCESS,
    FAIL,YES,NO,
    INTERNAL_SERVER,
    DELETE,PER_PAGE,MONTH,DAYS,MONTHLY,ANNUAL,
    ACTIVE,BAD_REQUEST,PROPERTY_IMAGE
} = require('../../utility/Constants')


/**
 * @description 'This function is use to user property list'
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

module.exports = {
    UserPropertyList: async (req, res) => {
        const requestParams = req.query;
        const {authUserId} = req
        let promise = [];
        const limit = requestParams.per_page && requestParams.per_page > 0
            ? parseInt(requestParams.per_page, 10)
            : PER_PAGE;
        const pageNo = requestParams.page && requestParams.page > 0
            ? parseInt(requestParams.page, 10)
            : 1;
        const offset = (pageNo - 1) * limit;
        let sorting = [['updatedAt', 'DESC']];
        let query = {
            user_id:authUserId,
            status: {
                [Op.not]: DELETE,
            }
        };
        await Property.findAll({
            where:query,
            order: sorting,
            offset,
            limit,
            include: [
                {
                    model: Property_view,
                    attributes: ['id', 'image']
                }
            ]
        }).then((data) => {
            if (data.length > 0) {
                data.forEach(function (t) {
                    t.Property_views.forEach(function (result) {
                        promise.push(new Promise(async (resolve, reject) => {
                            const profilePicture = (result.image) && result.image !== '' ? result.image : '';
                            result.image = await Helper.mediaUrl(PROPERTY_IMAGE, profilePicture);
                            resolve(true)
                        }))
                    })
                })
                Promise.all(promise).then(() => {
                    const extra = [];
                    extra.per_page = limit;
                    extra.total = data.count;
                    extra.page = pageNo;
                    return Response.successResponseData(
                        res,
                        data,
                        SUCCESS,
                        res.locals.__('success'),
                        extra
                    )
                })


            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('noDataFound'),
                    FAIL
                )
            }
        }, (e) => {
            console.log(e)
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
        const reqParam = req.fields;
        let imgNameArr = [];
        let image;
        let promise = [];
        const {authUserId} = req
        const requestObj = {
            address: Joi.string().required().trim(),
            category: Joi.string().required().trim(),
            latitude: Joi.number().required(),
            image: Joi.string().optional(),
            longitude: Joi.number().required(),
            price: Joi.number().required(),
            description: Joi.string().required()
        }
        const schema = Joi.object(requestObj)
        const {error} = schema.validate(reqParam)
        if (error) {
            return Response.validationErrorResponseData(
                res,
                res.__(Helper.validationMessageKey('addPropertyValidation', error))
            )
        } else {
            req.files.image.forEach(function (result) {
                if (result && result.size > 0) {
                    image = true;
                    const extension = result.type;
                    const imageExtArr = ['image/jpg', 'image/jpeg', 'image/png'];
                    if (result && result && (!imageExtArr.includes(extension))) {
                        return Response.errorResponseData(res, res.__('imageInvalid'), BAD_REQUEST);
                    }
                }
                const imageName = image ? `${moment().unix()}${path.extname(result.name)}` : '';
                imgNameArr.push(imageName);
            })
            const WorkExpObj = {
                user_id: authUserId,
                address: reqParam.address,
                category: reqParam.category,
                latitude: reqParam.latitude,
                longitude: reqParam.longitude,
                price: reqParam.price,
                description: reqParam.description,
                status: ACTIVE
            }
            await Property.create(WorkExpObj)
                .then(async (result) => {
                    if (result) {
                        let i = 0;
                        await imgNameArr.forEach(function (imagedata) {
                            promise.push(new Promise(async (resolve, reject) => {
                                if (image) {
                                    await Helper.multipleImageUpload(req, res, imagedata, i);
                                    const imageObj = {
                                        image: imagedata,
                                        user_id: authUserId,
                                        property_id: result.id,
                                        status: ACTIVE
                                    }
                                    await Property_view.create(imageObj).then();
                                    i++;
                                    resolve(true)
                                }
                            }))
                        })
                        Promise.all(promise).then(() => {
                            return Response.successResponseWithoutData(res, res.__('propertyAddedSuccessfully'), SUCCESS);
                        })
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
            id: Joi.number().required(),
            address: Joi.string().required().trim(),
            category: Joi.string().required().trim(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            price: Joi.number().required(),
            description: Joi.string().required()
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
                    user_id: authUserId
                },
            }).then(async (Data) => {
                if (Data) {
                    const ProObj = {
                        address: reqParam.address,
                        category: reqParam.category,
                        latitude: reqParam.latitude,
                        longitude: reqParam.longitude,
                        price: reqParam.price,
                        description: reqParam.description,
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

    /**
     * @description get property list
     * @param req
     * @param res
     * */

    PropertyList: async (req, res) => {
        const requestParams = req.query;
        const {authUserId} = req
        const limit = requestParams.per_page && requestParams.per_page > 0
            ? parseInt(requestParams.per_page, 10)
            : PER_PAGE;
        const pageNo = requestParams.page && requestParams.page > 0
            ? parseInt(requestParams.page, 10)
            : 1;
        const offset = (pageNo - 1) * limit;
        let promise = [];
        let sorting = [['updatedAt', 'DESC']];
        let query = {
            status: {
                [Op.not]: DELETE,
            }
        };
        await Property.findAll({
            where: query,
            order: sorting,
            offset,
            limit,
            include: [
                {
                    model: Property_view,
                    attributes: ['id', 'image']
                }
            ]
        }).then((data) => {
            if (data.length> 0) {
                data.forEach(function (t) {
                    t.Property_views.forEach(function (result) {
                        promise.push(new Promise(async (resolve, reject) => {
                            const profilePicture = (result.image) && result.image !== '' ? result.image : '';
                            result.image = await Helper.mediaUrl(PROPERTY_IMAGE, profilePicture);
                            resolve(true)
                        }))
                    })
                })
                Promise.all(promise).then(() => {
                    const extra = [];
                    extra.per_page = limit;
                    extra.total = data.count;
                    extra.page = pageNo;
                    return Response.successResponseData(
                        res,
                        data,
                        SUCCESS,
                        res.locals.__('success'),
                        extra
                    )
                })
            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('noDataFound'),
                    FAIL
                )
            }
        }, (e) => {
            console.log(e)
            Response.errorResponseData(
                res,
                res.__('internalError'),
                INTERNAL_SERVER
            )
        })
    },
}