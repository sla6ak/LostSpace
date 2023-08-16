"use client";
import Modal from "./components/Modals/Modal";
import { useState } from "react";
import ModalLogin from "./components/Modals/ModalLogin";
import ModalRegister from "./components/Modals/ModalRegister";

export default function Home() {
  const [modal, setModal] = useState(0);
  const onModalClose = () => {
    setModal(0);
  };
  const login = () => {
    setModal(1);
  };
  const register = () => {
    setModal(2);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#5582b4]">
      <div className="">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          onClick={login}
        >
          Game
        </button>
        {modal ? (
          <Modal
            onModalClose={() => {
              setModal(0);
            }}
          >
            {modal === 1 && (
              <ModalLogin onModalClose={onModalClose} register={register} />
            )}
            {modal === 2 && (
              <ModalRegister onModalClose={onModalClose} login={login} />
            )}
          </Modal>
        ) : null}
      </div>
    </main>
  );
}
