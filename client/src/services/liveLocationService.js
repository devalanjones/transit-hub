
import api from "./api";


export const getLatestBusLocation = async (busId) => {

    return await api.get(`/liveLocation/bus/${busId}/latest`);

};