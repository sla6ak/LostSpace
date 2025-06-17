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
import { useGetHeroQuery } from '@/redux/api/heroAPI';

interface WebSocketManagerProps {
  children: React.ReactNode;
}

export default function WebSocketManager({ children }: WebSocketManagerProps) {
  const user = useSelector((state: RootState) => state.user);
  const heroSlice = useSelector((state: RootState) => state.heroSlice);
  // будем контролировать изменения на сервере чтоб убедиться что мы онлаин
  const { data: hero, error: errorHero } = useGetHeroQuery();
  const dispatch = useDispatch<AppDispatch>();
  const [isConnectedToInfoRoom, setIsConnectedToInfoRoom] = useState(false);
  const isConnected = useSelector((state: RootState) => state.webSocket.isConnected);

  useEffect(() => {
    if (!user?.id || isConnectedToInfoRoom) {
      console.warn('Не удалось подключиться к InfoRoom: отсутствует userId.');
      return;
    }

    const handleConnectToInfoRoom = async (id: string) => {
      try {
        await dispatch(connectToInfoRoom(id));
        console.log('Успешно подключились к InfoRoom');
        setIsConnectedToInfoRoom(true);
      } catch (error) {
        console.error('Ошибка подключения к InfoRoom:', error);
      }
    };

    handleConnectToInfoRoom(user.id!);

    return () => {
      // console.log('Очистка useEffect: соединение с InfoRoom остается активным.');
    };
  }, [user?.id, dispatch, isConnectedToInfoRoom]);

  useEffect(() => {
    // console.log('Подключаемся к другим комнатам...', !hero?.online, !isConnectedToInfoRoom, !user?.id);
    if (!hero?.online || !isConnectedToInfoRoom || !user?.id) return;

    if (hero.planet === 'HomePlanet') {
      dispatch(connectToHomePlanetRoom(user.id!));
    } else if (hero.planet === 'Planet2') {
      dispatch(connectToPlanet2Room(user.id!));
    } else if (hero.planet === 'Planet3') {
      dispatch(connectToPlanet3Room(user.id!));
    }
  }, [heroSlice.online, isConnectedToInfoRoom, heroSlice.planet, user.id, dispatch, hero?.online, hero?.planet]);

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
