import DashBoard from "./pages/DashBoard"
import Layout from "./pages/Layout"
import Login from "./pages/Login"
import MenuBusinessMain from "./pages/menubusiness/MenuBusinessMain"
import OnlineOrders from "./pages/OnlineOrders"
import RestaurantStatusMain from "./pages/restaurantstatus/RestaurantStatusMain"
import SplashScreen from "./pages/SplashScreen"
import StockBusinessMain from "./pages/stockbusiness/StockBusinessMain"
import PrivateRoute from "./utils/routeUtils.tsx"
import { ReactNode } from "react"

interface CustomRouteObject {
    path?: string;
    element?: ReactNode;
    auth?: boolean;
    admin?: boolean;
    index?: boolean;
    children?: CustomRouteObject[];
}

const routes: CustomRouteObject[] = [
    {
        path: '/',
        element: <SplashScreen />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/dashboard',
        element: <Layout />,
        auth: true,
        children: [
            {
                index: true,
                element: <DashBoard></DashBoard>
            },
            {
                path: '/dashboard/onlineorders',
                element: <OnlineOrders></OnlineOrders>
            },
            {
                path: '/dashboard/restaurantstatus',
                element: <RestaurantStatusMain></RestaurantStatusMain>
            },
            {
                path: '/dashboard/stockbusiness',
                element: <StockBusinessMain></StockBusinessMain>
            },
            {
                path: '/dashboard/menubusiness',
                element: <MenuBusinessMain></MenuBusinessMain>
            }
        ]
    },
]

const authCheck = (routes: CustomRouteObject[]): CustomRouteObject[] =>
    routes.map((route) => {
        if (route?.auth) {
            route.element = <PrivateRoute type={route.admin ? "user" : undefined}>{route.element}</PrivateRoute>;
        }
        if (route?.children) {
            route.children = authCheck(route.children);
        }
        return route;
    });

export default authCheck(routes);