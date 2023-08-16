import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FC } from "react";
import closeImg from "./close.svg";
import Image from "next/image";

interface Props {
  children: any;
  onModalClose: () => void;
}

const Modal: FC<Props> = ({ onModalClose, children }: any) => {
  const [returnPortal, setReturnPortal] = useState(false);
  const ref = useRef<Element | null>(null);
  const mouseDownClose = (e: { target: any; currentTarget: any }) => {
    if (e.target === e.currentTarget) {
      onModalClose();
    }
  };

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>("#modal");
    setReturnPortal(!!ref.current);
  }, []);

  useEffect(() => {
    const keyDownClose = (e: { code: string }) => {
      if (e.code === "Escape") {
        onModalClose();
      }
    };

    window.addEventListener("keydown", keyDownClose);
    return () => {
      window.removeEventListener("keydown", keyDownClose);
    };
  }, [onModalClose]);

  return returnPortal
    ? createPortal(
        <div
          onClick={mouseDownClose}
          className="flex fixed flex-col top-0 right-0 py-2 px-2 z-50 w-full h-full bg-[#33333322]"
        >
          <div className="relative min-w-screen sm:min-w-[300px] min-h-screen sm:min-h-[200px] top-0 sm:top-[50%] left-0 sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:absolute flex flex-col justify-center align-middle rounded-md bg-white">
            <div className="" onClick={onModalClose}>
              <Image
                src={closeImg.src}
                alt=""
                className=" absolute w-5 h-5 top-4 right-4"
                width={40}
                height={40}
              />
            </div>
            {children}
          </div>
        </div>,
        ref.current!
      )
    : null;
};

export default Modal;
