'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  connectToHomePlanetRoom,
  connectToPlanet2Room,
  connectToPlanet3Room,
  connectToInfoRoom,
} from '@/redux/slices/sliceWebSocket';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';

interface WebSocketManagerProps {
  children: React.ReactNode;
}

export default function WebSocketManager({ children }: WebSocketManagerProps) {
  const user = useSelector((state: RootState) => state.user);
  const hero = useSelector((state: RootState) => state.heroSlice);
  const dispatch = useDispatch<AppDispatch>();
  const [isConnectedToInfoRoom, setIsConnectedToInfoRoom] = useState(false);
  const isConnected = useSelector((state: RootState) => state.webSocket.isConnected);

  useEffect(() => {
    // console.log(user);
    if (!user?.id || isConnectedToInfoRoom) {
      console.warn('Не удалось подключиться к InfoRoom: отсутствует userId.');
      return;
    }

    let isCancelled = false;
    const handleConnectToInfoRoom = async (id: string) => {
      try {
        await dispatch(connectToInfoRoom(id));

        if (isCancelled) return;
        console.log('Успешно подключились к InfoRoom');
        setIsConnectedToInfoRoom(true);
      } catch (error) {
        console.error('Ошибка подключения к InfoRoom:', error);
      }
    };

    handleConnectToInfoRoom(user.id!);

    return () => {
      isCancelled = true;
      console.log('Очистка useEffect: соединение с InfoRoom остается активным.');
    };
  }, [user?.id, dispatch, isConnectedToInfoRoom]);

  useEffect(() => {
    if (!hero?.online || !isConnectedToInfoRoom || !user?.id) return;

    // console.log('Подключаемся к другим комнатам...');

    if (hero.planet === 'HomePlanet') {
      dispatch(connectToHomePlanetRoom(user.id!));
    } else if (hero.planet === 'Planet2') {
      dispatch(connectToPlanet2Room(user.id!));
    } else if (hero.planet === 'Planet3') {
      dispatch(connectToPlanet3Room(user.id!));
    }
  }, [hero?.online, isConnectedToInfoRoom, hero.planet, user?.id, dispatch]);

  if (!isConnected) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <LoadingOverlay />
          <p>Connecting to the game server...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
