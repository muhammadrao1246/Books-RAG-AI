import React from "react";

import { ROUTES } from "src/routes";
import { Button } from "src/components/Button"

import { Formik, Form , Field } from 'formik';
import * as yup from 'yup';


import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Link as DOMLink } from "react-router-dom";

import { useResetPasswordMutation } from "src/services/api";

import { ClosableToast } from 'src/components/global/Toast';
import { useDispatch } from "react-redux";

const validationSchema = yup.object().shape({
  password: yup.string().required("required").min(8),
  password2: yup.string().required("required").oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

const ResetPassword = () => {
    const navigate = useNavigate()
    const {uid, token} = useParams()

    
  const [loading, setLoading] = useOutletContext().loader

    
    const [apiMessage, SetApiMessage] = React.useState([])
    const [resetPassword, {isLoading}] = useResetPasswordMutation()
    const handleSubmit = async (values) => {
      console.log(values);
      setLoading(true)
        let data = {
            body: values,
            params: {
              uid: uid,
              token: token
            }
        }
        const response = await resetPassword(data)
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
            setTimeout(() => {
              navigate(ROUTES.FORGOT)
            }, 2000);
            
        } else {
            ClosableToast("Your password has been reset successfully", "success", 2000);
            setTimeout(() => {
              navigate(ROUTES.LOGIN)
            }, 1000);
        }
        setLoading(false)
    }


  return (
    <div className=" w-screen h-screen flex justify-center items-center">
      <div className="w-[28em]">
        <div>
          <h2 className="text-[36px] font-bold mb-[10px] text-indigo-950">Reset Password</h2>
          <p className="font-medium text-gray-500 text-base mb-[36px]">Please enter your password and confirm password</p>
        </div>
        
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
            <>
              <Form>

                <p className="mb-[8px] font-medium text-indigo-950">
                  New Password<span className="text-indigo-600">*</span>
                </p>
                <Field
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  type="password"
                  placeholder="Enter your new password"
                  name="password"
                  validate={true}
                  className="w-full font-medium text-base bg-transparent placeholder-gray-400 text-gray-500 border border-1 border-grey-200 rounded-[12px] h-[54px] px-[20px] mb-[24px]"
                  required
                />

                <p className="mb-[8px] font-medium text-indigo-950">
                  Confirm Password<span className="text-indigo-600">*</span>
                </p>
                <Field
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password2}
                  type="password"
                  placeholder="Enter your password again"
                  name="password2"
                  validate={true}
                  className="w-full font-medium text-base bg-transparent placeholder-gray-400 text-gray-500 border border-1 border-grey-200 rounded-[12px] h-[54px] px-[20px] mb-[24px]"
                  required
                />

                <Button type="submit" value="Change Password" />

                <p className="text-indigo-950 font-medium text-sm text-center">
                  Don't want to reset password?{" "}
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
  )
}


export default ResetPassword;

