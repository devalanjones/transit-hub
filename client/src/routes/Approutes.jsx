import { Routes, Route } from "react-router-dom"
import Dashboard from "../pages/admin/Dashboard";
// import Home from "../pages/user/Home";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import BusList from "../pages/admin/buses/BusList";
import BusDetails from "../pages/admin/buses/BusDetails";
import CreateBus from "../pages/admin/buses/CreateBus";
import UpdateBus from "../pages/admin/buses/UpdateBus";
import RouteList from "../pages/admin/routes/RouteList";
import RouteDetails from "../pages/admin/routes/RouteDetails";
import CreateRoute from "../pages/admin/routes/CreateRoute";
import UpdateRoute from "../pages/admin/routes/UpdateRoute";
import StopList from "../pages/admin/stops/StopList";
import StopDetails from "../pages/admin/stops/StopDetails";
import CreateStop from "../pages/admin/stops/CreateStop";
import UpdateStop from "../pages/admin/stops/UpdateStop";
import ScheduleList from "../pages/admin/schedules/ScheduleList";
import ScheduleDetails from "../pages/admin/schedules/ScheduleDetails";
import CreateSchedule from "../pages/admin/schedules/CreateSchedule";
import UpdateSchedule from "../pages/admin/schedules/UpdateSchedule";
import UserList from "../pages/admin/user/UserList";


const AppRoutes = () => {

    return (



        <Routes>

            <Route path={"/admin"} element={<AdminLayout />}>

                <Route path={"dashboard"} element={<Dashboard />} />

                <Route path={"users"} element={<UserList />} />

                <Route path={"buses"} element={<BusList />} />

                <Route path={"buses/:id"} element={<BusDetails />} />

                <Route path={"buses/create"} element={<CreateBus />} />

                <Route path={"buses/:id/edit"} element={<UpdateBus />} />

                <Route path={"routes"} element={<RouteList />} />

                <Route path={"routes/:id"} element={<RouteDetails />} />

                <Route path={"routes/create"} element={<CreateRoute />} />

                <Route path={"routes/:id/edit"} element={<UpdateRoute />} />

                <Route path={"stops"} element={<StopList />} />

                <Route path={"stops/:id"} element={<StopDetails />} />

                <Route path={"stops/create"} element={<CreateStop />} />

                <Route path={"stops/:id/edit"} element={<UpdateStop />} />

                <Route path={"schedules"} element={<ScheduleList />} />

                <Route path={"schedules/:id"} element={<ScheduleDetails />} />

                <Route path={"schedules/create"} element={<CreateSchedule />} />

                <Route path={"schedules/:id/edit"} element={<UpdateSchedule />} />

            </Route>

            {/* <Route path="/home" element={<ProtectedRoute allowedRole="user"> <Home /> </ProtectedRoute>} /> */}


        </Routes>

    )
}

export default AppRoutes;