import { FC } from "react";
import React, { useState, SetStateAction } from "react";
import { useRegistrationUserMutation } from "@/app/redux/api/authAPI";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { newToken } from "@/app/redux/slices/sliceToken";
import { validationLoginSchema } from "../../helpers/validation";

interface Props {
  login: () => void;
  onModalClose: () => void;
}
interface ApiResponse {
  data?: any;
  error?: any;
}
const ModalRegister: FC<Props> = ({ onModalClose, login }: any) => {
  const [email, setEmail] = useState("");
  const [nikName, setNikName] = useState("");
  const [password, setPassword] = useState("");
  const [createUser, { isError }] = useRegistrationUserMutation();
  const dispatch = useDispatch();

  const handleEmail = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setEmail(event.target.value);
  };
  const handleLogin = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setNikName(event.target.value);
  };
  const handlePassword = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setPassword(event.target.value);
  };

  const onSubmitLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      const valid = await validationLoginSchema.validate({
        nikName,
        password,
      });
    } catch (error) {
      toast.warn(`${error}`);
      return;
    }
    const send = { nikName: nikName, email: email, password: password };
    const responseLogin: ApiResponse = await createUser(send);
    // console.log(responseLogin);
    if (responseLogin.error?.status === 404) {
      toast.error("User not found");
      return;
    }
    if (responseLogin.data) {
      dispatch(newToken(responseLogin.data.token));
      toast.success("Successful login user!");
    }
  };
  return (
    <div className=" p-8 w-full max-w-md">
      <h1 className="flex text-blue-700 text-2xl align-middle justify-center items-center mb-8 font-bold">
        Register
      </h1>
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
            name="login"
            value={nikName}
            onChange={handleLogin}
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
        <p className="mr-2">Do you have account? </p>
        <span onClick={login} className=" text-[#2859a1] cursor-pointer">
          login
        </span>
      </p>
    </div>
  );
};

export default ModalRegister;
