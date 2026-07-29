import React from "react";
import {
  Routes,
  Route,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";

import { BrowserRouter } from "react-router-dom";

// routes/url.jsx have all urls defined in a map
import { ROUTES } from "src/routes";

import MainLayout from "src/components/layouts/MainLayout";
import AuthLayout from "src/components/layouts/AuthLayout";
import Login from "src/pages/auth/Login";
import Register from "src/pages/auth/Register";
import ForgotPassword from "src/pages/auth/ForgotPassword";
import ResetPassword from "src/pages/auth/ResetPassword";

import { PrivateRoute, PublicRoute } from "src/helpers/protectors";

// all pages components are declared here
const CHAT_PAGE = React.lazy(() => import("src/pages/chat/index"));
const BOOK_PAGE = React.lazy(() => import("src/pages/book/index"));

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes that include the sidebar and topbar */}
        <Route
          errorElement={<ErrorHandler />}
          path="/"
          element={<PrivateRoute><MainLayout /></PrivateRoute>}
        >
          <Route path={ROUTES.CHAT} element={<CHAT_PAGE />} />
          <Route path={ROUTES.BOOK} element={<PrivateRoute allowedRoles={["admin"]}> <BOOK_PAGE /> </PrivateRoute>} />
        </Route>
        {/* Routes that do not include the sidebar and topbar */}
        <Route
          errorElement={<ErrorHandler />}
          path="/"
          element={<PublicRoute><AuthLayout /></PublicRoute>}
        >
          <Route index path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Register />} />
          <Route path={ROUTES.FORGOT} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        </Route>
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

// error pages
function ErrorHandler() {
  const error = useRouteError();

  // if item not found or page not found error
  if (isRouteErrorResponse(error) && error.status == 404) {
    return <h1>Not Found Error 404</h1>;
  }
  // if a server error
  else if (isRouteErrorResponse(error) && error.status == 500) {
    return <h1>Internal Server Error 500</h1>;
  } else if (isRouteErrorResponse(error) && error.status == 401) {
    return <h1>Token Expired Error 401</h1>;
  }

  return <h1>Unknown Error</h1>;
}
