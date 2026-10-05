import * as yup from "yup";


const homeSchema = yup.object({

    from: yup
        .string()
        .required("Please select a starting stop."),

    fromSelected: yup
        .boolean()
        .oneOf([true], "Please enter a valid starting stop."),

    to: yup
        .string()
        .required("Please select a destination stop.")
        .test(
            "different-stops",
            "Starting stop and destination stop cannot be the same.",
            function (value) {
                if (!value || !this.parent.from) {
                    return true;
                }
                
                return value !== this.parent.from;
            }
        ),

    toSelected: yup
        .boolean()
        .oneOf([true], "Please enter a valid destination stop."),
});

export default homeSchema;