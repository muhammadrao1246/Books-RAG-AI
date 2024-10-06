import React from 'react'
import {
  Routes,
  Route,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';


// routes/url.jsx have all urls defined in a map
import {ROUTES} from 'src/routes';

import "src/assets/css/index.css"

import MainLayout from 'src/components/Layouts/MainLayout';
import AuthLayout from 'src/components/Layouts/AuthLayout';
import Login from 'src/pages/auth/login';
import Signup from 'src/pages/auth/signup';
import ForgotPassword from 'src/pages/auth/ForgotPassword';
import ResetPassword from 'src/pages/auth/ResetPassword';

import { PrivateRoute, PublicRoute } from 'src/helpers/protectors';


// all pages components are declared here
const DASHBOARD_PAGE = React.lazy(() => import("src/pages/dashboard/index"))


// error pages
function ErrorHandler(){
  const error = useRouteError()

  // if item not found or page not found error
  if (isRouteErrorResponse(error) && error.status == 404)
  {
    return <h1>Not Found Error 404</h1>
  }
  // if a server error
  else if(isRouteErrorResponse(error) && error.status == 500)
  {
    return <h1>Internal Server Error 500</h1>
  }
  else if(isRouteErrorResponse(error) && error.status == 401)
  {
    return <h1>Token Expired Error 401</h1>
  }

  return <h1>Unknown Error</h1>
}



function App() {
  const [theme, colorMode] = useMode();

  React.useEffect(()=>{
    // TimeAgo.addDefaultLocale(en); // setting output timesince language as english
    TimeAgo.addLocale(en); // setting output timesince language as english
  },[])


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Routes that include the sidebar and topbar */}
          <Route errorElement={<ErrorHandler />} path="/" element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DASHBOARD_PAGE />} />
            
          </Route>
          {/* Routes that do not include the sidebar and topbar */}
          <Route errorElement={<ErrorHandler />} path="/" element={<AuthLayout />}>
            <Route index path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<Signup />} />
            <Route path={ROUTES.FORGOT} element={<ForgotPassword />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          </Route>
          <Route path='*' element={<h1>Page Not Found</h1>} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
