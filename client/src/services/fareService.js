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

export const createFare = (fareData) => {

    return api.post("/busFare", fareData);
};

export const getFareById = (id) => {

    return api.get(`/busFare/${id}`);
};

export const updateFare = (id, fareData) => {

    return api.put(`/busFare/${id}`, fareData);
};