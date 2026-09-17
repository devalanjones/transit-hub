import * as yup from "yup";

const createRouteSchema = yup.object({

    source: yup
        .string()
        .trim()
        .required("Source is required"),

    destination: yup
        .string()
        .trim()
        .required("Destination is required")
        .test(
            "different-from-source",
            "Source and Destination cannot be the same",
            function (value) {

                return value?.trim().toLowerCase() !==
                    this.parent.source?.trim().toLowerCase();
            }
        ),

});

export default createRouteSchema;