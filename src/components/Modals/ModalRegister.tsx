import React, { FC, useState, SetStateAction } from 'react';
import { useRegistrationUserMutation } from '../../redux/api/authAPI';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { newToken } from '../../redux/slices/sliceToken';
import { setUser } from '../../redux/slices/sliceUser';
import { validationRegisterSchema } from '../../helpers/validation';

interface Props {
  login: () => void;
  onModalClose: () => void;
}

const ModalRegister: FC<Props> = ({ onModalClose, login }) => {
  const [email, setEmail] = useState('');
  const [nikName, setNikName] = useState('');
  const [password, setPassword] = useState('');
  const [createUser, { error: apiError }] = useRegistrationUserMutation();
  const dispatch = useDispatch();

  const handleEmail = (event: { target: { value: SetStateAction<string> } }) => {
    setEmail(event.target.value);
  };
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
      await validationRegisterSchema.validate({
        nikName,
        password,
        email,
      });

      // Отправка запроса
      const response = await createUser({
        nikName,
        email,
        password,
      }).unwrap();
      // console.log('Server response:', response);

      if (response.token && response.user) {
        dispatch(setUser(response.user));
        toast.success('Registration successful!');
        dispatch(newToken(response.token));
        onModalClose();
      } else {
        console.error('Invalid server response structure:', response);
        toast.error('Invalid server response');
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      if (error.name === 'ValidationError') {
        console.error('Client validation failed:', error.message);
        toast.error(error.message);
      } else if (error.data?.message) {
        console.error('Server error:', error.data.message);
        toast.error(error.data.message);
      } else if (error.message) {
        console.error('Other error:', error.message);
        toast.error(error.message);
      } else if (apiError) {
        // Обработка ошибок API
        const errorMessage =
          'data' in apiError ? (apiError.data as any)?.message : 'An error occurred during registration';
        toast.error(errorMessage);
      } else {
        console.error('Unknown error:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="p-8 w-full max-w-md">
      <h1 className="flex text-blue-700 text-2xl align-middle justify-center items-center mb-8 font-bold">Register</h1>
      <form onSubmit={onSubmitLogin} className="flex flex-col">
        <label className="block text-gray-700 text-sm font-bold mb-6">
          Email:
          <input
            required
            placeholder="example@example.com"
            type="text"
            name="email"
            value={email}
            onChange={handleEmail}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
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
        <span className="mr-2">Do you have account? </span>
        <span onClick={login} className=" text-[#2859a1] cursor-pointer">
          login
        </span>
      </p>
    </div>
  );
};

export default ModalRegister;
