import React, { useContext } from 'react';

import { Box, Button, TextField, Typography, useTheme, IconButton, Link } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

import useMediaQuery from '@mui/material/useMediaQuery';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext, tokens } from "src/theme";

import { useNavigate } from "react-router-dom";
import { Link as DOMLink } from "react-router-dom";

import { useForgotPasswordMutation, useLoginUserMutation } from "src/services/api";

import FormAlertsComponent from "src/components/global/FormAlertsComponent";

import { ROUTES } from "src/routes";
import { ClosableToast } from 'src/components/global/Toast';

const validationSchema = yup.object().shape({
    email: yup.string().required("required").email(),
  });

const ForgotPassword = () => {
    const navigate = useNavigate()

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const isNonMobile = useMediaQuery('(min-width:600px)');

    
    const [apiMessage, SetApiMessage] = React.useState([])
    const [ForgotPassword, {isLoading}] = useForgotPasswordMutation()
    const handleSubmit = async (values) => {
        
        // const response = await ForgotPassword(values)
        // if (!!response.error) {
        //     let dataObject = response.error.data;
        //     SetApiMessage(
        //         Object.keys(dataObject.errors).map((errorType, index) => {
        //           return {
        //             type: errorType,
        //             message: dataObject.errors[errorType],
        //           };
        //         })
        //       );
            
        // } else {
        //     let dataObject = response.data;
        //     ClosableToast("One-Time Password Reset Link sent Successfully!", "success", 2000);
            
        //     ClosableToast("One-Time Password Reset Link is valid for 15 minutes", "warning", 2000);
        //     navigate(ROUTES.LOGIN)
        // }

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
              Don&apos;t Remember Your Password?
            </Typography>
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              sx={{ mb: "36px" }}
            >
              one time password reset link will be sent to this email
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
              initialValues={{ email: "" }}
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
                    type="email"
                    label="Email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                  >
                    Get Password Reset Link
                  </Button>
                  <Typography variant="body" align="center" gutterBottom>
                    Already know credentials?
                    <Link
                      component={DOMLink}
                      to={ROUTES.LOGIN}
                      color={colors.greenAccent[400]}
                      sx={{ ml: "5px" }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
      </Box>
    );
};

export default ForgotPassword;
