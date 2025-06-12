'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Hero from '@/components/ThreeComponents/HeroTest';
import { Debug, Physics } from '@react-three/rapier';
import HomePlanet from '../../components/Planets/HomePlanet';
import AuthRoute from '../../components/AuthRoute/AuthRoute';
import WebSocketManager from '@/components/WebSocketManager/WebSocketManager';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import GameUI from '@/components/GameUI/GameUI';
import CameraFollower from '@/components/ThreeComponents/CameraFollower';

export default function Game() {
  return (
    <AuthRoute>
      <WebSocketManager>
        <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
          <GameUI />
          <Suspense fallback={<LoadingOverlay />}>
            <Canvas>
              <Physics gravity={[0, 0, 0]}>
                <Debug />
                <HomePlanet />
                <Hero />
                <CameraFollower />
              </Physics>
            </Canvas>
          </Suspense>
        </div>
      </WebSocketManager>
    </AuthRoute>
  );
}
