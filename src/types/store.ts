import { Room } from 'colyseus.js';

// Тип технологии робота
export interface RobotTechnology {
  name: string;
  bonusType: 'attack' | 'health' | 'defense';
  bonusValue: number;
}
export interface HeroPosit {
  x: number;
  y: number;
  z: number;
}
// Тип одного робота
export interface Robot {
  name: string;
  health: number;
  defense: number;
  attack: number;
  status: 'active' | 'repairing' | 'destroyed';
  damagePercent: number;
  repairEndTime: string | null;
  technologies: RobotTechnology[];
}

// Полная структура героя
export interface HeroState {
  nickname: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  planet: string;
  oxigen: number;
  rating: number;
  cristals: number;
  energy: number;
  bonuses: [];
  disbonuses: [];
  qvests: [];
  items: [];
  robots: Robot[];
  specialization: string;
  data: string | null;
  online: boolean;
  updatedAt?: string;
}

// Учётные данные пользователя (без игровых полей)
export interface UserState {
  id: string | null;
  nikName: string | null;
  email: string | null;
  online: boolean;
  registrationDate?: string;
}

export interface RootState {
  token: string | null;
  user: UserState | null;
}
export interface WebSocketRoomsState {
  isConnected: boolean;
  chatRoom: Room | null;
  homePlanetRoom: Room | null;
  planet2Room: Room | null;
  planet3Room: Room | null;
  error: string | null;
}
export interface WebSocketStatusState {
  isConnected: boolean;
  infoRoomId: string | null;
  chatRoomId: string | null;
  homePlanetRoomId: string | null;
  planet2RoomId: string | null;
  planet3RoomId: string | null;
  error: string | null;
}
export const validKeysHeroUpdate = [
  'position',
  'rotation',
  'nickname',
  'planet',
  'oxigen',
  'rating',
  'cristals',
  'energy',
  'bonuses',
  'disbonuses',
  'tehnologies',
  'qvests',
  'items',
  'specialization',
  'online',
  'robots',
];
