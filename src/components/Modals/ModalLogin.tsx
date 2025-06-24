import React, { FC, useState, SetStateAction } from 'react';
import { useLoginUserMutation } from '../../redux/api/API';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { newToken } from '../../redux/slices/sliceToken';
import { setUser } from '../../redux/slices/sliceUser';
import { validationLoginSchema } from '../../helpers/validation';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface Props {
  register: () => void;
  onModalClose: () => void;
}
interface ApiResponse {
  data?: any;
  error?: SerializedError | FetchBaseQueryError;
}

const ModalLogin: FC<Props> = ({ onModalClose, register }: any) => {
  const [nikName, setNikName] = useState('');
  const [password, setPassword] = useState('');
  const [createUser, { error: apiError }] = useLoginUserMutation();
  const dispatch = useDispatch();

  const handleNikName = (event: { target: { value: SetStateAction<string> } }) => {
    setNikName(event.target.value);
  };
  const handlePassword = (event: { target: { value: SetStateAction<string> } }) => {
    setPassword(event.target.value);
  };

  const onSubmitLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      // Валидация формы
      const validationResult = await validationLoginSchema.validate({ nikName, password });
      if (!validationResult) {
        toast.error('Validation failed');
        return;
      }

      // Отправка запроса
      const send = { nikName: nikName, password: password };
      const responseLogin: ApiResponse = await createUser(send);

      // Обработка ошибок API
      if (apiError) {
        const errorMessage = 'data' in apiError ? (apiError.data as any)?.message : 'An error occurred during login';
        toast.error(errorMessage);
        return;
      }

      // Обработка ответа
      if (responseLogin.error) {
        if ('status' in responseLogin.error && responseLogin.error.status === 404) {
          toast.error('User not found');
        } else {
          toast.error('Login failed');
        }
        return;
      }

      if (responseLogin.data) {
        dispatch(newToken(responseLogin.data.token));
        dispatch(setUser(responseLogin.data.user));
        toast.success('Successful login user!');
        onModalClose();
      }
    } catch (error) {
      // Обработка ошибок валидации и других исключений
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className=" p-8 w-full max-w-md">
      <h1 className="flex text-blue-700 text-2xl align-middle justify-center items-center mb-8 font-bold">Login</h1>
      <form onSubmit={onSubmitLogin} className="flex flex-col">
        <label className="block text-gray-700 text-sm font-bold mb-6">
          NikName:
          <input
            required
            placeholder="Hero"
            type="text"
            name="nikName"
            value={nikName}
            onChange={handleNikName}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
        <label className="block text-gray-700 text-sm font-bold mb-6">
          Password:
          <input
            required
            placeholder="*****"
            type="text"
            name="password"
            value={password}
            onChange={handlePassword}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
        <input
          type="submit"
          value="Submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        />
      </form>
      <p className="flex justify-center">
        <span className="mr-2">Do not have account? </span>
        <span onClick={register} className=" text-[#2859a1] cursor-pointer">
          register
        </span>
      </p>
    </div>
  );
};

export default ModalLogin;
