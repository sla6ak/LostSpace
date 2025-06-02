import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { WebSocketRoomsState, RoomData } from '../../types/store';
import { Client } from 'colyseus.js';
import { setUser } from './sliceUser'; // Импортируем action для обновления пользователя

const initialState: WebSocketRoomsState = {
  isConnected: false,
  infoRoom: null as RoomData | null,
  chatRoom: null as RoomData | null,
  homePlanetRoom: null as RoomData | null,
  planet2Room: null as RoomData | null,
  planet3Room: null as RoomData | null,
  error: null,
};

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    connectInfoSuccess: (state, action: PayloadAction<RoomData>) => {
      state.infoRoom = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Info connection successful');
    },
    connectChatSuccess: (state, action: PayloadAction<RoomData>) => {
      state.chatRoom = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Chat connection successful');
    },
    connectHomePlanetSuccess: (state, action: PayloadAction<RoomData>) => {
      state.homePlanetRoom = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('HomePlanet connection successful');
    },
    connectPlanet2Success: (state, action: PayloadAction<RoomData>) => {
      state.planet2Room = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Planet2 connection successful');
    },
    connectPlanet3Success: (state, action: PayloadAction<RoomData>) => {
      state.planet3Room = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Planet3 connection successful');
    },
    connectFailure: (state, action: PayloadAction<string>) => {
      state.isConnected = false;
      state.error = action.payload;
      toast.error(`WebSocket connection failed: ${action.payload}`);
    },
    disconnect: (state) => {
      state.isConnected = false;
      state.chatRoom = null;
      state.homePlanetRoom = null;
      state.planet2Room = null;
      state.planet3Room = null;
      state.error = null;
      toast.info('WebSocket connection lost');
    },
    connectInfoRoomSuccess: (state, action: PayloadAction<{ roomId: string; name: string }>) => {
      state.isConnected = true;
      state.error = null;
      toast.success('InfoRoom connection successful');
    },
  },
});

export const {
  connectChatSuccess,
  connectHomePlanetSuccess,
  connectPlanet2Success,
  connectPlanet3Success,
  connectFailure,
  disconnect,
  connectInfoSuccess,
  connectInfoRoomSuccess,
} = webSocketSlice.actions;
export default webSocketSlice;

// Thunks для подключения к разным комнатам
export const connectToInfoRoom = (endpoint: string, userId: string) => async (dispatch: any) => {
  try {
    const client = new Client(endpoint);
    const room: any = await client.joinOrCreate('InfoRoom', { userId });
    console.log('Параметры подключения к InfoRoom:', { endpoint, userId });
    console.log('Ответ от сервера после подключения к InfoRoom:', room);
    const roomData = { roomId: room.roomId, name: room.name };
    dispatch(connectInfoRoomSuccess(roomData));
    // Обновляем isAuth только после успешного входа в комнату
    if (room) {
      dispatch(setUser({ isAuth: true }));
    }
    room.onLeave(() => {
      console.log('Disconnected from InfoRoom');
      dispatch(disconnect());
      dispatch(setUser({ isAuth: false }));
    });
  } catch (error: any) {
    dispatch(connectFailure(error.message));
  }
};

export const connectToChatRoom = (endpoint: string, userId: string) => async (dispatch: any) => {
  try {
    const client = new Client(endpoint);
    const room = await client.joinOrCreate('chat', { userId });
    dispatch(connectChatSuccess(room));
    room.onMessage('*', (type: string | number, message: any) => {
      console.log('ChatRoom message:', type, message);
    });
    room.onLeave((code) => {
      console.log('Left chat room with code:', code);
      dispatch(disconnect());
    });
  } catch (error: any) {
    dispatch(connectFailure(error.message));
  }
};

export const connectToHomePlanetRoom = (endpoint: string, userId: string) => async (dispatch: any) => {
  try {
    const client = new Client(endpoint);
    const room: any = await client.joinOrCreate('HomePlanet', { userId });
    const roomData = { roomId: room.roomId, name: room.name }; // Используем временный тип any
    dispatch(connectHomePlanetSuccess(roomData));
    room.onMessage('*', (type: string | number, message: any) => {
      console.log('HomePlanetRoom message:', type, message);
    });
    room.onLeave((code: any) => {
      console.log('Left home planet room with code:', code);
      dispatch(disconnect());
    });
  } catch (error: any) {
    dispatch(connectFailure(error.message));
  }
};

export const connectToPlanet2Room = (endpoint: string, userId: string) => async (dispatch: any) => {
  try {
    const client = new Client(endpoint);
    const room = await client.joinOrCreate('Planet2', { userId });
    dispatch(connectPlanet2Success(room));
    room.onMessage('*', (type: string | number, message: any) => {
      console.log('Planet2Room message:', type, message);
    });
    room.onLeave((code) => {
      console.log('Left planet2 room with code:', code);
      dispatch(disconnect());
    });
  } catch (error: any) {
    dispatch(connectFailure(error.message));
  }
};

export const connectToPlanet3Room = (endpoint: string, userId: string) => async (dispatch: any) => {
  try {
    const client = new Client(endpoint);
    const room = await client.joinOrCreate('Planet3', { userId });
    dispatch(connectPlanet3Success(room));
    room.onMessage('*', (type: string | number, message: any) => {
      console.log('Planet3Room message:', type, message);
    });
    room.onLeave((code) => {
      console.log('Left planet3 room with code:', code);
      dispatch(disconnect());
    });
  } catch (error: any) {
    dispatch(connectFailure(error.message));
  }
};

export const disconnectFromInfoRoom = () => (dispatch: any) => {
  dispatch(disconnect());
};

export const reconnectToRooms = (endpoint: string, userId: string) => async (dispatch: any, getState: any) => {
  const state = getState().webSocket;
  const roomsToReconnect = [
    { room: state.infoRoom, connectAction: connectToInfoRoom },
    { room: state.chatRoom, connectAction: connectToChatRoom },
    { room: state.homePlanetRoom, connectAction: connectToHomePlanetRoom },
    { room: state.planet2Room, connectAction: connectToPlanet2Room },
    { room: state.planet3Room, connectAction: connectToPlanet3Room },
  ];

  for (const { room, connectAction } of roomsToReconnect) {
    if (room) {
      try {
        await dispatch(connectAction(endpoint, userId));
        console.log(`Reconnected to room: ${room.name}`);
      } catch (error) {
        console.error(`Failed to reconnect to room: ${room.name}`, error);
      }
    }
  }
};

// Обновляем логику для переподключения через события комнат
export const initializeWebSocket = (endpoint: string, userId: string) => async (dispatch: any) => {
  try {
    const client = new Client(endpoint);
    const room = await client.joinOrCreate('InfoRoom', { userId });

    room.onError((code, message) => {
      console.error(`Room error: ${code}, ${message}`);
      dispatch(connectFailure(`Room error: ${message}`));
    });

    room.onLeave(() => {
      console.warn('Room connection lost. Attempting to reconnect...');
      dispatch(reconnectToRooms(endpoint, userId));
    });

    return room;
  } catch (error: any) {
    console.error('Failed to initialize WebSocket:', error);
    dispatch(connectFailure(error.message));
  }
};
