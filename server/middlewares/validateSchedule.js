const { scheduleValidationSchema, updateScheduleValidationSchema } = require("../validations/scheduleValidation")

const validateSchedule = (req, res, next) => {
    const { error, value } = scheduleValidationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    })

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map((e) => e.message)
        })
    }

    req.body = value

    next()
}

const validateUpdateSchedule = (req, res, next) => {
    const { error, value } = updateScheduleValidationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    })

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map((e) => e.message)
        })
    }

    req.body = value

    next()
}

module.exports = {
    validateSchedule,
    validateUpdateSchedule
}