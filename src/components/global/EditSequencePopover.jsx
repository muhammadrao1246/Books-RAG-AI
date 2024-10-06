import React from "react";
import { Box, Button, Popover, TextField, useTheme } from "@mui/material";
import { Formik, Form } from "formik";
import { tokens } from "src/theme";

import * as yup from "yup";

const validationSchema = yup.object().shape({
  words: yup.string().required("required"),
});

function EditSequencePopover({
  word,
  handleSubmit,
  popOpen,
  setPopOpen,
  target,
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Popover
      open={popOpen}
      anchorEl={target}
      onClose={() => setPopOpen(false)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Formik
        initialValues={{
          words: word,
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
              padding: theme.spacing(1),
            }}
            // color={colors.blueAccent[100]}
          >
            <TextField
              fullWidth
              variant="filled"
              size="small"
              type="text"
              label="Modify Words"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.words}
              name="words"
              error={!!touched.words && !!errors.words}
              helperText={touched.words && errors.words}
            />

            <Box display={"flex"} justifyContent={"end"} gap={"10px"}>
              <Button
                onClick={() => setPopOpen(false)}
                variant="outlined"
                color="info"
                fullWidth
                size="medium"
              >
                Cancel
              </Button>
              <Button fullWidth size="medium" type="submit" variant="contained" color="warning">
                Modify
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Popover>
  );
}

export default EditSequencePopover;
