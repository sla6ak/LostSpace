export interface UserState {
  id: string | null;
  nikName: string | null;
  email: string | null;
  isAuth: boolean;
  rating: number;
  planet: string | null;
  cristals: number;
  energy: number;
  oxigen: number;
  bonuses: string[];
  disbonuses: string[];
  tehnologies: string[];
  qvests: string[];
  items: string[];
  robots: string[];
  specialization: string | null;
  data: string | null;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface RootState {
  token: string | null;
  user: UserState | null;
}

export interface RoomData {
  roomId: string;
  name: string;
}

export interface WebSocketRoomsState {
  isConnected: boolean;
  infoRoom: RoomData | null;
  chatRoom: RoomData | null;
  homePlanetRoom: RoomData | null;
  planet2Room: RoomData | null;
  planet3Room: RoomData | null;
  error: string | null;
}
