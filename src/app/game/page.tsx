'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Hero from '@/components/ThreeComponents/Hero';
import { Debug, Physics } from '@react-three/rapier';
import PlanetUniversal from '../../components/Planets/PlanetUniversal';
import AuthRoute from '../../components/AuthRoute/AuthRoute';
import WebSocketManager from '@/components/WebSocketManager/WebSocketManager';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import GameUI from '@/components/GameUI/GameUI';

export default function Game() {
  return (
    <AuthRoute>
      <WebSocketManager>
        <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
          <GameUI />
          <Suspense fallback={<LoadingOverlay />}>
            <Canvas>
              <Physics gravity={[0, 0, 0]} timeStep="vary">
                <Debug />
                <PlanetUniversal />
                <Hero />
              </Physics>
            </Canvas>
          </Suspense>
        </div>
      </WebSocketManager>
    </AuthRoute>
  );
}
