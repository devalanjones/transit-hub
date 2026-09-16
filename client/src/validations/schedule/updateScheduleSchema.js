import * as yup from "yup";

const timeString = yup
  .string()
  .matches(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Please use 24-hour HH:mm format"
  );

const updateScheduleSchema = yup.object({
  busId: yup.string(),
  routeId: yup.string(),
  stops: yup
    .array()
    .of(
      yup.object({
        stopId: yup.string().required("Stop is required"),
        stopSequence: yup
          .number()
          .typeError("Stop sequence must be a number")
          .integer()
          .min(1)
          .required("Stop sequence is required"),
        expectedArrivalTime: timeString.required("Expected arrival time is required"),
      })
    )
    .min(2, "At least 2 stops are required"),

  arrivalTime: timeString,
  departureTime: timeString,

  days: yup
    .array()
    .of(yup.string())
    .min(1, "At least one operational day is required"),

  status: yup
    .string()
    .oneOf(
      ["ON_TIME", "DELAYED", "CANCELLED", "COMPLETED"],
      "Invalid schedule status"
    ),
});

export default updateScheduleSchema;