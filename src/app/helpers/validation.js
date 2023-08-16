import * as yup from "yup";
export const validationRegisterSchema = yup.object({
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  nikName: yup
    .string("Enter your email")
    .min(3, "min 3 letters")
    .max(20, "max 20 letters")
    .required("Email is required"),
  password: yup
    .string("Enter your password")
    .min(5, "Password should be of minimum 5 characters length")
    .max(20, "max 20 letters")
    .required("Password is required"),
});
export const validationLoginSchema = yup.object({
  nikName: yup
    .string("Enter your email")
    .min(3, "min 3 letters")
    .max(20, "max 20 letters")
    .required("Email is required"),
  password: yup
    .string("Enter your password")
    .min(5, "Password should be of minimum 5 characters length")
    .max(20, "max 20 letters")
    .required("Password is required"),
});
