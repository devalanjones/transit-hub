import api from "./api";


export const getAllFares = () => {

    return api.get("/busFare");
};

export const getAllBusTypes = () => {

    return api.get("/busFare");
};

export const calculateFare = (fareData) => {

    return api.post("/busFare/fare", fareData);
};