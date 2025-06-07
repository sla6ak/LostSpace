import { Middleware } from '@reduxjs/toolkit';
import { setPosition, setRotation } from '../slices/sliceStateHero';

// Глобальная переменная для хранения ссылки на InfoRoom
let infoRoom: any = null;

// Экшен для инициализации infoRoom (вызывать после подключения)
export const setInfoRoomInstance = (room: any) => {
  infoRoom = room;
};

// Мидлвар для отправки позиции и ротации героя на сервер
export const heroPositionMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Отправляем только если infoRoom и action — setPosition/setRotation
  if (infoRoom) {
    if (action.type === setPosition.type || action.type === setRotation.type) {
      const state = store.getState();
      const { position, rotation } = state.heroSlice;
      // Отправляем на сервер только если есть userId
      const userId = state.user?.id;
      if (userId) {
        infoRoom.send('updateHeroState', {
          userId,
          position,
          rotation,
        });
      }
    }
  }
  return result;
};
