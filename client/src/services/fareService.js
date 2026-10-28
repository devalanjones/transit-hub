import api from "./api";


export const getAllBusTypes = () => {

    return api.get("/busFare");
};