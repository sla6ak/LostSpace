'use client';

import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Hero from '@/components/ThreeComponents/Hero';
import { Physics } from '@react-three/cannon';
import HomePlanet from '../../components/Planets/HomePlanet';
import AuthRoute from '../../components/AuthRoute/AuthRoute';
import { Mesh, Vector3 } from 'three';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  connectToHomePlanetRoom,
  connectToPlanet2Room,
  connectToPlanet3Room,
  connectToChatRoom,
  connectToInfoRoom,
} from '@/redux/slices/sliceWebSocket';
import './loading.css';

function ThirdPersonCamera({ heroRef }: { heroRef: React.RefObject<Mesh> }) {
  const { camera } = useThree();
  useFrame(() => {
    if (heroRef.current) {
      const pos = heroRef.current.position;
      // Камера позади и чуть выше героя
      const cameraOffset = new Vector3(0, 5, -15);
      const cameraTarget = pos.clone().add(cameraOffset);
      camera.position.lerp(cameraTarget, 0.15);
      camera.lookAt(pos);
    }
  });
  return null;
}

export default function Game() {
  const heroRef = useRef<Mesh>(null);
  const isConnected = useSelector((state: RootState) => state.webSocket.isConnected);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [isConnectedToInfoRoom, setIsConnectedToInfoRoom] = useState(false);

  useEffect(() => {
    if (!user?.id || isConnectedToInfoRoom) {
      console.warn('Не удалось подключиться к InfoRoom: отсутствует userId.');
      return;
    }

    let isCancelled = false;

    const handleConnectToInfoRoom = async (id: string) => {
      try {
        console.log('Подключаемся к InfoRoom...');
        await dispatch(connectToInfoRoom(process.env.PUBLIC_WS_URL || 'ws://localhost:5000', id));

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
    if (!user?.isAuth || !isConnectedToInfoRoom || !user?.id) return;

    console.log('Подключаемся к другим комнатам...');

    dispatch(connectToChatRoom(process.env.PUBLIC_WS_URL || 'ws://localhost:5000', user.id!));

    if (user.planet === 'HomePlanet') {
      dispatch(connectToHomePlanetRoom(process.env.PUBLIC_WS_URL || 'ws://localhost:5000', user.id!));
    } else if (user.planet === 'Planet2') {
      dispatch(connectToPlanet2Room(process.env.PUBLIC_WS_URL || 'ws://localhost:5000', user.id!));
    } else if (user.planet === 'Planet3') {
      dispatch(connectToPlanet3Room(process.env.PUBLIC_WS_URL || 'ws://localhost:5000', user.id!));
    }
  }, [user?.isAuth, isConnectedToInfoRoom, user?.planet, user?.id, dispatch]);

  if (!isConnected) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Connecting to the game server...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthRoute>
      <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
        <Suspense fallback={<div>Loading 3D Scene...</div>}>
          <Canvas>
            <Physics>
              <HomePlanet />
              <Hero ref={heroRef} />
              <ThirdPersonCamera heroRef={heroRef} />
            </Physics>
          </Canvas>
        </Suspense>
      </div>
    </AuthRoute>
  );
}
