const Joi = require("joi");

const objectId = Joi.string().hex().length(24).messages({
  "string.hex": "Invalid ObjectId format",
  "string.length": "ObjectId must be exactly 24 characters",
});

const dateFormat = Joi.date().iso().messages({
  "date.base": "Time must be a valid ISO date",
  "date.format": "Time must be in ISO 8601 format",
});

const daysEnum = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const statusEnum = ["ON_TIME", "DELAYED", "CANCELLED", "COMPLETED"];

const stopItemSchema = Joi.object({
  stopId: objectId.required(),
  stopSequence: Joi.number().integer().min(1).required(),
  expectedArrivalTime: dateFormat.required().messages({
    "any.required": "Stop arrival time is required",
  }),
});

const scheduleValidationSchema = Joi.object({
  busId: objectId.required(),
  routeId: objectId.required(),
  departureTime: dateFormat.required().messages({
    "any.required": "Departure time is required",
  }),
  arrivalTime: dateFormat
    .greater(Joi.ref("departureTime"))
    .required()
    .messages({
      "any.required": "Arrival time is required",
      "date.greater": "Arrival time must be after departure time",
    }),
  stops: Joi.array()
    .items(stopItemSchema)
    .min(2)
    .unique("stopId")
    .unique("stopSequence")
    .required()
    .messages({
      "array.min":
        "A schedule must have at least an origin and a destination stop",
      "array.unique": "Duplicate stopId or stopSequence found in stops array",
    }),
  days: Joi.array()
    .items(Joi.string().valid(...daysEnum))
    .min(1)
    .unique()
    .required(),
  status: Joi.string()
    .valid(...statusEnum)
    .default("ON_TIME"),
});

const updateScheduleValidationSchema = Joi.object({
  busId: objectId,
  routeId: objectId,
  departureTime: dateFormat,
  arrivalTime: dateFormat.when("departureTime", {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref("departureTime")).messages({
      "date.greater": "Arrival time must be after departure time",
    }),
  }),
  stops: Joi.array()
    .items(stopItemSchema)
    .min(2)
    .unique("stopId")
    .unique("stopSequence"),
  days: Joi.array()
    .items(Joi.string().valid(...daysEnum))
    .min(1)
    .unique(),
  status: Joi.string().valid(...statusEnum),
}).min(1);

const searchBusScheduleSchema = Joi.object({
  from: objectId.required().messages({
    "any.required": "'from' stop ID is required",
    "string.empty": "'from' stop ID cannot be empty",
  }),
  to: objectId.invalid(Joi.ref("from")).required().messages({
    "any.required": "'to' stop ID is required",
    "string.empty": "'to' stop ID cannot be empty",
    "any.invalid": "'from' and 'to' stops cannot be identical",
  }),
  date: dateFormat,
  day: Joi.string().valid(...daysEnum),
}).oxor("date", "day");

module.exports = {
  daysEnum,
  statusEnum,
  scheduleValidationSchema,
  updateScheduleValidationSchema,
  searchBusScheduleSchema,
};
