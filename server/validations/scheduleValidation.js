const Joi = require("joi");

const objectId = Joi.string()
  .hex()
  .length(24)
  .message("Invalid ObjectId format");

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

const scheduleValidationSchema = Joi.object({
  busId: objectId.required(),
  routeId: objectId.required(),
  stops: Joi.array()
    .items(
      Joi.object({
        stopId: objectId.required(),
        stopSequence: Joi.number().integer().min(1).required(),
        expectedArrivalTime: dateFormat.required().messages({
          "any.required": "Stop arrival time is required",
        }),
      }),
    )
    .min(2)
    .required()
    .messages({
      "array.min":
        "A schedule must have at least an origin and a destination stop",
    }),
  arrivalTime: dateFormat.required().messages({
    "any.required": "Arrival time is required",
  }),
  departureTime: dateFormat.required().messages({
    "any.required": "Departure time is required",
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
  stops: Joi.array()
    .items(
      Joi.object({
        stopId: objectId.required(),
        stopSequence: Joi.number().integer().min(1).required(),
        expectedArrivalTime: dateFormat.required().messages({
          "any.required": "Stop arrival time is required",
        }),
      }),
    )
    .min(2),
  arrivalTime: dateFormat,
  departureTime: dateFormat,
  days: Joi.array()
    .items(Joi.string().valid(...daysEnum))
    .min(1)
    .unique(),
  status: Joi.string().valid(...statusEnum),
}).min(1);

// Schema for searching scheduled buses
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
}).oxor("date", "day"); // ensures caller doesn't provide both conflicting values

module.exports = {
  daysEnum,
  scheduleValidationSchema,
  updateScheduleValidationSchema,
  searchBusScheduleSchema,
};
