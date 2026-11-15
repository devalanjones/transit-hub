import Swal from "sweetalert2";

const showUnavailable = (navigate) => {
    Swal.fire({
        icon: "info",
        title: "Feature Unavailable",
        text: "This feature is currently unavailable. Please check back later.",
        confirmButtonText: "Go Back",
        confirmButtonColor: "#2563eb",
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            navigate(-1);
        }
    });
};

export default showUnavailable;