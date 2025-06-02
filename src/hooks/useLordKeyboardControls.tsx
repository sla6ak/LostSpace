import { useState, useEffect } from 'react';
function actionByKey(key: string | number) {
  const keys: Record<string, string> = {
    KeyW: 'moveForward',
    KeyS: 'moveBackward',
    KeyA: 'moveLeft',
    KeyD: 'moveRight',
    Space: 'jump',
  };
  return keys[key];
}

export const useLordKeyboardControls = () => {
  const [movement, setMovement] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: { code: string }) => {
      // Movement key
      if (actionByKey(e.code)) {
        setMovement((state) => {
          if (e.code === 'Space' && state.jump === true) {
            return {
              ...state,
              [actionByKey(e.code)]: false,
            };
          }
          return {
            ...state,
            [actionByKey(e.code)]: true,
          };
        });
      }
    };
    const handleKeyUp = (e: { code: any }) => {
      if (actionByKey(e.code)) {
        setMovement((state) => ({
          ...state,
          [actionByKey(e.code)]: false,
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};
