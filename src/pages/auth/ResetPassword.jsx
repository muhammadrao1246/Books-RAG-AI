import React, { useContext } from 'react';

import { Box, Button, TextField, Typography, useTheme, IconButton, Link } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

import useMediaQuery from '@mui/material/useMediaQuery';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useNavigate, useParams } from "react-router-dom";
import { Link as DOMLink } from "react-router-dom";

import { ColorModeContext, tokens } from "src/theme";
import FormAlertsComponent from "src/components/global/FormAlertsComponent";

import { ROUTES } from "src/routes";
import { ClosableToast } from 'src/components/global/Toast';

const validationSchema = yup.object().shape({
  password: yup.string().required("required").min(8),
  password2: yup.string().required("required").oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

const ResetPassword = () => {
    const navigate = useNavigate()
    const {uid, token} = useParams()

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const isNonMobile = useMediaQuery('(min-width:600px)');

    
    const [apiMessage, SetApiMessage] = React.useState([])
    const [resetPassword, {isLoading}] = useResetPasswordMutation()
    const handleSubmit = async (values) => {
        let data = {
            body: values,
            params: {
              uid: uid,
              token: token
            }
        }
    }

    return (
      <Box height="100vh" bgcolor={colors.primary[600]} display="flex" flexDirection="column">
        <Box
          display="flex"
          alignItems="start"
          justifyContent="end"
          p={2}
          width="100vw"
        >
          <IconButton  onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <LightModeOutlinedIcon sx={{color: "#e0e0e0"}} />
            ) : (
              <DarkModeOutlinedIcon sx={{color: "#e0e0e0"}} />
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
              Reset Your Password
            </Typography>
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              sx={{ mb: "36px" }}
            >
              enter your new password
            </Typography>

            {apiMessage.map((message) => (
              <FormAlertsComponent
                key={message.type}
                type={message.type}
                message={message.message}
                sx={{ mb: 2 }}
              />
            ))}
            <Formik
              initialValues={{ 
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
                    type="password"
                    label="New Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="password"
                    label="Confirm Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password2}
                    name="password2"
                    error={!!touched.password2 && !!errors.password2}
                    helperText={touched.password2 && errors.password2}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                  >
                    Change Password
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
      </Box>
    );
};

export default ResetPassword;
