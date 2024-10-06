import React, { useContext } from 'react';

import { Box, Button, TextField, Typography, useTheme, IconButton, Link, Divider } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

import useMediaQuery from '@mui/material/useMediaQuery';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useNavigate } from "react-router-dom";
import { Link as DOMLink } from "react-router-dom";

import { ColorModeContext, tokens } from "src/theme";

import FormAlertsComponent from "src/components/global/FormAlertsComponent";

import { ROUTES } from "src/routes";


// import ReactFacebookLogin from 'react-facebook-login';
// import ReactGoogleLogin from 'react-google-login';
// import { VITE_SOCIAL_AUTH_FACEBOOK_KEY, VITE_SOCIAL_AUTH_GOOGLE_OAUTH2_KEY } from 'src/config';

import { FacebookOutlined, Google } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setUserToken } from 'src/services/authSlice';
import { setUserInfo } from 'src/services/userSlice';
import { storeToken } from 'src/services/token';
import { render } from '@fullcalendar/core/preact';
 
const validationSchema = yup.object().shape({
    fullname: yup.string().required("required"),
    email: yup.string().required("required").email(),
    password: yup.string().required("required").min(8),
    password2: yup.string().required("required").oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

const Signup = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const isNonMobile = useMediaQuery('(min-width:600px)');

    const [apiMessage, SetApiMessage] = React.useState([])
    const [registerUser, {isLoading}] = useRegisterUserMutation()
    const handleSubmit = async (values) => {

    }

    

    return (
      <Box height="100vh" bgcolor={colors.primary[600]} sx={{overflowY: "auto", position: "relative"}} display="flex" flexDirection="column">
        <Box
          display="flex"
          alignItems="start"
          justifyContent="end"
          p={2}
          width="100vw"
        >
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon   sx={{color: "#e0e0e0"}} />
            ) : (
              <LightModeOutlinedIcon  sx={{color: "#e0e0e0"}} />
            )}
          </IconButton>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Box
            width="100%"
            maxWidth="400px"
            padding="32px"
            borderRadius="8px"
            bgcolor={colors.primary[900]}
          >
            <Typography
              variant="h2"
              color={colors.grey[100]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Sign Up
            </Typography>
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              sx={{ mb: "36px" }}
            >
              Fill out these fields to signup
            </Typography>

            {
              apiMessage.map(message=>(
                <FormAlertsComponent
                key={message.type}
                  type={message.type}
                  message={message.message}
                  sx={{mb: 2}} 
                  />
              ))
            }
            
            <Formik
              initialValues={{
                fullname: "",
                // username: "",
                email: "",
                password: "",
                password2: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <>
                <Form
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing(2),
                  }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.fullname}
                    name="fullname"
                    error={!!touched.fullname && !!errors.fullname}
                    helperText={touched.fullname && errors.fullname}
                  />
                  {/* <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Username"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.username}
                                name="username"
                                error={!!touched.username && !!errors.username}
                                helperText={touched.username && errors.username}
                            /> */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="email"
                    label="Email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="password"
                    label="Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="password"
                    label="Confirm Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password2}
                    name="password2"
                    error={!!touched.password2 && !!errors.password2}
                    helperText={touched.password2 && errors.password2}
                  />
                  <Typography variant="body2" align="left" gutterBottom>
                    By signing up, you confirm that you've read and accept our
                    <Link
                      component={DOMLink}
                      to={"#toc"}
                      color={colors.greenAccent[200]}
                      sx={{ ml: "5px", mr: "5px" }}
                    >
                      Terms of Services
                    </Link>
                    and
                    <Link
                      component={DOMLink}
                      to={"#privacy_policy"}
                      color={colors.greenAccent[200]}
                      sx={{ ml: "5px" }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                  >
                    Sign Up
                  </Button>
                  <Typography variant="body" align="center" gutterBottom>
                    Already have an account?
                    <Link
                      component={DOMLink}
                      to={ROUTES.LOGIN}
                      color={colors.greenAccent[200]}
                      sx={{ ml: "5px" }}
                    >
                      Login
                    </Link>
                  </Typography>
                </Form>
                </>
              )}
            </Formik>
          </Box>
        </Box>
      </Box>
    );
};

export default Signup;
