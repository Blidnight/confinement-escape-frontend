import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import Home from "./Home/Home";
import Room from "./Room/Room";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>,
    },
    {
        path: "/room/:roomId",
        element: <Room/>
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
  