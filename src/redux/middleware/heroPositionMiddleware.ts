import { Middleware } from '@reduxjs/toolkit';
import { setPosition, setRotation } from '../slices/sliceStateHero';

// этот миделвар будет содержать именно ту комнату которая подключена
// так как герой не может быть в 2х комнатах одновременно поэтому отправка будет куда нужно

// Глобальная переменная для хранения ссылки на InfoRoom
let planetRoom: any = null;

// Экшен для инициализации infoRoom (вызывать после подключения)
export const setPlanetRoomInstance = (room: any) => {
  planetRoom = room;
};

// Мидлвар для отправки позиции и ротации героя на сервер
export const heroPositionMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  // Отправляем только если infoRoom и action — setPosition/setRotation
  if (planetRoom) {
    // console.log('sending updateHeroState');
    if (action.type === setPosition.type || action.type === setRotation.type) {
      const state = store.getState();
      const { position, rotation, planet } = state.heroSlice;
      // Отправляем на сервер только если есть userId
      const userId = state.user?.id;
      if (userId) {
        planetRoom.send('updateHeroState', {
          userId,
          position,
          rotation,
          planet,
        });
      }
    }
  }
  return result;
};
