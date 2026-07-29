import React from "react";

import { ROUTES } from "src/routes";
import { Button } from "src/components/Button"

import { Formik, Form , Field } from 'formik';
import * as yup from 'yup';


import { useNavigate, useOutletContext } from "react-router-dom";
import { Link as DOMLink } from "react-router-dom";

import { useForgotPasswordMutation } from "src/services/api";

import { ClosableToast } from 'src/components/global/Toast';
import { useDispatch } from "react-redux";


const validationSchema = yup.object().shape({
  email: yup.string().required("required").email(),
});
const ForgotPassword = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  const [loading, setLoading] = useOutletContext().loader

  const [apiMessage, SetApiMessage] = React.useState([])
    const [ForgotPassword, {isLoading}] = useForgotPasswordMutation()
    const handleSubmit = async (values) => {
      console.log(values);
      setLoading(true)
        const response = await ForgotPassword(values)
        if (!!response.error) {
            let dataObject = response.error.data;
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
            let dataObject = response.data;
            ClosableToast("One-Time Password Reset Link sent Successfully!", "success", 2000);
            
            ClosableToast("One-Time Password Reset Link is valid for 15 minutes", "warning", 2000);
            navigate(ROUTES.LOGIN)
        }
setLoading(false)
    }



  return (
    <div className=" w-screen h-screen flex justify-center items-center">
      <div className="w-[28em]">
        <div>
          <h2 className="text-[24px] font-bold mb-[10px] text-indigo-950">
            Remember Your Password?
          </h2>
          <p className="font-medium text-gray-500 text-base mb-[36px]">
            One time password reset link will be sent to this email
          </p>
        </div>

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


                <Button type="submit" value="Get Password Reset Link" />

                <p className="text-indigo-950 font-medium text-sm text-center">
                  Already know credentials?{" "}
                  <DOMLink
                    to={ROUTES.LOGIN}
                    className="text-base font-semibold text-indigo-600"
                  >
                    Login here
                  </DOMLink>
                </p>
              </Form>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ForgotPassword;
