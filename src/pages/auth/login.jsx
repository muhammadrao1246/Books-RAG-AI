import React, { useContext } from "react";

import { Button } from "src/components/Button";
// import { Input } from "src/components/Input";
import { GoogleSignInButton } from "src/components/widget/SocialAuthButtons";

import { ROUTES } from "src/routes";
import * as yup from "yup";

import { useLoginUserMutation } from "src/services/api";

import { useNavigate, useOutletContext } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { Link as DOMLink } from "react-router-dom";

import { useDispatch } from "react-redux";
import { setUserToken } from "src/services/authSlice";
import { setUserInfo } from "src/services/userSlice";
import { ClosableToast } from "src/components/global/Toast";

const validationSchema = yup.object().shape({
  email: yup.string().required("required").email(),
  password: yup.string().required("required"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  console.log(useOutletContext())
  const [loading, setLoading] = useOutletContext().loader
  

  const [apiMessage, SetApiMessage] = React.useState([]);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true)
    const response = await loginUser(values);
    if (!!response.error) {
      let dataObject = response.error.data;
      console.log(dataObject.errors);
      SetApiMessage(
        Object.keys(dataObject.errors).map((errorType, index) => {
          ClosableToast(`${dataObject.errors[errorType]}`, "error", 2000);
          return {
            type: errorType,
            message: dataObject.errors[errorType],
          };
        })
      );
    } else {
      console.log("Login Success");
      let dataObject = response.data;
      dispatch(setUserToken(dataObject.data.token));
      dispatch(setUserInfo(dataObject.data.user));

      ClosableToast("User logged in successfully!", "success", 2000);
      console.log(dataObject);
      setTimeout(() => {
        navigate(ROUTES.CHAT);
      }, 1500);
    }
    setLoading(false)
  };

  return (
    <div className=" w-screen h-full flex justify-center items-center py-8">
      <div className="w-[28em]">
        <div>
          <h2 className="text-[36px] font-bold mb-[10px] text-indigo-950">
            Sign In
          </h2>
          <p className="font-medium text-gray-500 text-base mb-[36px]">
            Enter your email and password to sign in!
          </p>
        </div>
        <GoogleSignInButton isLoginLoading={isLoading} />
        <div className="flex justify-center items-center mb-[25px] gap-3">
          <div className="h-[1px] w-full bg-gray-200"></div>
          <p className="font-medium text-gray-500">or</p>
          <div className="h-[1px] w-full bg-gray-200"></div>
        </div>
        <Formik
          initialValues={{ email: "", password: "" }}
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
              <Form>
                <p className="mb-[8px] font-medium text-indigo-950">
                  Email<span className="text-indigo-600">*</span>
                </p>
                <Field
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  type="email"
                  placeholder="Enter your email address"
                  name="email"
                  validate={true}
                  required
                  className="w-full font-medium text-base bg-transparent placeholder-gray-400 text-gray-500 border border-1 border-grey-200 rounded-[12px] h-[54px] px-[20px] mb-[24px]"
                />

                <p className="mb-[8px] font-medium text-indigo-950">
                  Password<span className="text-indigo-600">*</span>
                </p>
                <Field
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  validate={true}
                  className="w-full font-medium text-base bg-transparent placeholder-gray-400 text-gray-500 border border-1 border-grey-200 rounded-[12px] h-[54px] px-[20px] mb-[24px]"
                  required
                />

                <p className="text-end mb-[24px]">
                  <DOMLink
                    to={ROUTES.FORGOT}
                    className="text-base font-semibold text-indigo-600"
                  >
                    Forgot password?
                  </DOMLink>
                </p>

                <Button type="submit" value="Sign In" />

                <p className="text-indigo-950 font-medium text-sm text-center">
                  Not registered yet?{" "}
                  <DOMLink
                    to={ROUTES.SIGNUP}
                    className="text-base font-semibold text-indigo-600"
                  >
                    Create an Account
                  </DOMLink>
                </p>
              </Form>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
