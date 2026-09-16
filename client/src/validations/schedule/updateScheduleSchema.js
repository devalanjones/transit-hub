
import * as yup from "yup";



const updateScheduleSchema = yup.object({

    busId: yup
        .string()
        .required("Bus is required"),

    routeId: yup
        .string()
        .required("Route is required"),

    stops: yup
        .array()
        .of(
            yup.object({
                stopId: yup
                    .string()
                    .required("Stop is required"),

                stopSequence: yup
                    .number()
                    .required("Stop sequence is required"),

                expectedArrivalTime: yup
                    .string()
                    .required("Expected arrival time is required")
                    .matches(
                        /^([01]\d|2[0-3]):([0-5]\d)$/,
                        "Please use 24-hour HH:mm format")
            })

        )
        .min(2, "At least 2 stops are required")
        .required("Stops are required"),

    arrivalTime: yup
        .string()
        .required("Arrival time is required")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/,
            "Please use 24-hour HH:mm format"),

    departureTime: yup
        .string()
        .required("Departure time is required")
        .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Please use 24-hour HH:mm format"),

    days: yup
        .array()
        .of(yup.string())
        .min(1, "At least one operational day is required")
        .required("Days are required"),

    status: yup
        .string()
        .oneOf(
            ["ON_TIME", "DELAYED", "CANCELLED", "COMPLETED"],
            "Invalid schedule status"
        )
        .required("Status is required")

});

export default updateScheduleSchema;