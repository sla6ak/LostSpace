import { object, string } from 'yup';

export const validationRegisterSchema = object({
  email: string().email('Enter a valid email').required('Email is required'),
  nikName: string()
    .min(3, 'Nickname should be at least 3 characters')
    .max(20, 'Nickname should not exceed 20 characters')
    .required('Nickname is required'),
  password: string()
    .min(6, 'Password should be at least 6 characters')
    .max(15, 'Password should not exceed 15 characters')
    .required('Password is required'),
});

export const validationLoginSchema = object({
  nikName: string()
    .min(3, 'Nickname should be at least 3 characters')
    .max(20, 'Nickname should not exceed 20 characters')
    .required('Nickname is required'),
  password: string()
    .min(6, 'Password should be at least 6 characters')
    .max(15, 'Password should not exceed 15 characters')
    .required('Password is required'),
});
