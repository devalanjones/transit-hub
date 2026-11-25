import * as yup from "yup";

const updateFareSchema = yup.object({

    busType: yup
        .string()
        .trim()
        .required("Bus Type is required")
        .min(2, "Bus Type must be at least 2 characters")
        .max(50, "Bus Type cannot exceed 50 characters")
        .matches(
            /^[A-Za-z ]+$/,
            "Bus Type can only contain letters and spaces"
        ),

    baseFare: yup
        .number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Base Fare must be a valid number")
        .required("Base Fare is required")
        .moreThan(0, "Base Fare must be greater than 0"),

    farePerKm: yup
        .number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Fare Per KM must be a valid number")
        .required("Fare Per KM is required")
        .moreThan(0, "Fare Per KM must be greater than 0"),

});

export default updateFareSchema;