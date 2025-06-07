import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from 'colyseus.js';
import { toast } from 'react-toastify';

interface WebSocketStatusState {
  isConnected: boolean;
  infoRoomId: string | null;
  chatRoomId: string | null;
  homePlanetRoomId: string | null;
  planet2RoomId: string | null;
  planet3RoomId: string | null;
  error: string | null;
}

const initialState: WebSocketStatusState = {
  isConnected: false,
  infoRoomId: null,
  chatRoomId: null,
  homePlanetRoomId: null,
  planet2RoomId: null,
  planet3RoomId: null,
  error: null,
};

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    connectChatSuccess: (state, action: PayloadAction<string>) => {
      state.chatRoomId = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Чат connection successful');
    },
    connectInfoSuccess: (state, action: PayloadAction<string>) => {
      state.infoRoomId = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Info connection successful');
    },
    connectHomePlanetSuccess: (state, action: PayloadAction<string>) => {
      state.homePlanetRoomId = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('HomePlanet connection successful');
    },
    connectPlanet2Success: (state, action: PayloadAction<string>) => {
      state.planet2RoomId = action.payload;
      state.isConnected = true;
      state.error = null;
      toast.success('Planet2 connection successful');
    },
    connectPlanet3Success: (state, action: PayloadAction<string>) => {
      state.planet3RoomId = action.payload;
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
      state.chatRoomId = null;
      state.infoRoomId = null;
      state.homePlanetRoomId = null;
      state.planet2RoomId = null;
      state.planet3RoomId = null;
      state.error = null;
      toast.info('WebSocket connection lost');
    },
    disconnectChatRoom: (state) => {
      state.chatRoomId = null;
      toast.info('Chat room disconnected');
    },
    disconnectInfoRoom: (state) => {
      state.infoRoomId = null;
      toast.info('Info room disconnected');
    },
    disconnectHomePlanetRoom: (state) => {
      state.homePlanetRoomId = null;
      toast.info('HomePlanet room disconnected');
    },
    disconnectPlanet2Room: (state) => {
      state.planet2RoomId = null;
      toast.info('Planet2 room disconnected');
    },
    disconnectPlanet3Room: (state) => {
      state.planet3RoomId = null;
      toast.info('Planet3 room disconnected');
    },
  },
});

export const {
  connectChatSuccess,
  connectInfoSuccess,
  connectHomePlanetSuccess,
  connectPlanet2Success,
  connectPlanet3Success,
  connectFailure,
  disconnect,
  disconnectChatRoom,
  disconnectInfoRoom,
  disconnectHomePlanetRoom,
  disconnectPlanet2Room,
  disconnectPlanet3Room,
} = webSocketSlice.actions;

const endpoint =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_WS_URL || 'wss://your-production-url.com'
    : 'ws://localhost:5000';

const colyseusClient = new Client(endpoint);

// --- Переменные для контроля переподключения ---
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 2000; // 2 секунды
let chatReconnectAttempts = 0;
let infoReconnectAttempts = 0;
let homePlanetReconnectAttempts = 0;
let planet2ReconnectAttempts = 0;
let planet3ReconnectAttempts = 0;

// Функции подключения к разным комнатам
export const connectToChatRoom = (userId: string) => async (dispatch: any) => {
  try {
    const room = await colyseusClient.joinOrCreate('chat', { userId });
    chatReconnectAttempts = 0;
    dispatch(connectChatSuccess((room as any).id));
    room.onMessage('*', (type: string | number, message: any) => {
      // console.log('ChatRoom message:', type, message);
    });
    const reconnect = () => {
      if (chatReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        chatReconnectAttempts++;
        setTimeout(() => {
          dispatch(connectToChatRoom(userId));
        }, BASE_RECONNECT_DELAY * chatReconnectAttempts);
      } else {
        dispatch(connectFailure('Не удалось переподключиться к чату.'));
      }
    };
    room.onLeave((code) => {
      console.log('Left chat room with code:', code);
      if (code === 1006) {
        reconnect();
      } else {
        dispatch(disconnect());
      }
    });
    room.onError?.((code: any, message: any) => {
      console.warn('Room, onError (chat):', code, message);
      reconnect();
    });
  } catch (error: any) {
    chatReconnectAttempts++;
    if (chatReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        dispatch(connectToChatRoom(userId));
      }, BASE_RECONNECT_DELAY * chatReconnectAttempts);
    } else {
      dispatch(connectFailure('Не удалось переподключиться к чату.'));
    }
  }
};

export const connectToInfoRoom = (userId: string) => async (dispatch: any) => {
  try {
    const room = await colyseusClient.joinOrCreate('info', { userId });
    infoReconnectAttempts = 0;
    dispatch(connectInfoSuccess((room as any).id));
    // room.onMessage('*', (type: string | number, message: any) => {
    //   console.log('InfoRoom message:', type, message);
    // });
    room.onMessage('heroStateUpdate', (data) => {
      // обновить локальный state других игроков
    });
    const reconnect = () => {
      if (infoReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        infoReconnectAttempts++;
        setTimeout(() => {
          dispatch(connectToInfoRoom(userId));
        }, BASE_RECONNECT_DELAY * infoReconnectAttempts);
      } else {
        dispatch(connectFailure('Не удалось переподключиться к infoRoom.'));
      }
    };
    room.onLeave((code: number) => {
      console.log('Left info room with code:', code);
      if (code === 1006) {
        reconnect();
      } else {
        dispatch(disconnect());
      }
    });
    room.onError?.((code: any, message: any) => {
      console.warn('Room, onError (info):', code, message);
      reconnect();
    });
  } catch (error: any) {
    infoReconnectAttempts++;
    if (infoReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        dispatch(connectToInfoRoom(userId));
      }, BASE_RECONNECT_DELAY * infoReconnectAttempts);
    } else {
      dispatch(connectFailure('Не удалось переподключиться к infoRoom.'));
    }
  }
};

export const connectToHomePlanetRoom = (userId: string) => async (dispatch: any) => {
  try {
    const room = await colyseusClient.joinOrCreate('homeplanet', { userId });
    homePlanetReconnectAttempts = 0;
    dispatch(connectHomePlanetSuccess((room as any).id));
    // room.onMessage('*', (type: string | number, message: any) => {
    //   console.log('HomePlanetRoom message:', type, message);
    // });
    room.onMessage('planetPlayers', (players) => {
      // обновить локальный state всех игроков на планете
    });
    const reconnect = () => {
      if (homePlanetReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        homePlanetReconnectAttempts++;
        setTimeout(() => {
          dispatch(connectToHomePlanetRoom(userId));
        }, BASE_RECONNECT_DELAY * homePlanetReconnectAttempts);
      } else {
        dispatch(connectFailure('Не удалось переподключиться к homeplanet.'));
      }
    };
    room.onLeave((code) => {
      console.log('Left home planet room with code:', code);
      if (code === 1006) {
        reconnect();
      } else {
        dispatch(disconnect());
      }
    });
    room.onError?.((code: any, message: any) => {
      console.warn('Room, onError (homeplanet):', code, message);
      reconnect();
    });
  } catch (error: any) {
    homePlanetReconnectAttempts++;
    if (homePlanetReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        dispatch(connectToHomePlanetRoom(userId));
      }, BASE_RECONNECT_DELAY * homePlanetReconnectAttempts);
    } else {
      dispatch(connectFailure('Не удалось переподключиться к homeplanet.'));
    }
  }
};

export const connectToPlanet2Room = (userId: string) => async (dispatch: any) => {
  try {
    const room = await colyseusClient.joinOrCreate('planet2', { userId });
    planet2ReconnectAttempts = 0;
    dispatch(connectPlanet2Success((room as any).id));
    // room.onMessage('*', (type: string | number, message: any) => {
    //   console.log('Planet2Room message:', type, message);
    // });
    room.onMessage('planetPlayers', (players) => {
      // обновить локальный state всех игроков на планете
    });
    const reconnect = () => {
      if (planet2ReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        planet2ReconnectAttempts++;
        setTimeout(() => {
          dispatch(connectToPlanet2Room(userId));
        }, BASE_RECONNECT_DELAY * planet2ReconnectAttempts);
      } else {
        dispatch(connectFailure('Не удалось переподключиться к planet2.'));
      }
    };
    room.onLeave((code) => {
      console.log('Left planet2 room with code:', code);
      if (code === 1006) {
        reconnect();
      } else {
        dispatch(disconnect());
      }
    });
    room.onError?.((code: any, message: any) => {
      console.warn('Room, onError (planet2):', code, message);
      reconnect();
    });
  } catch (error: any) {
    planet2ReconnectAttempts++;
    if (planet2ReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        dispatch(connectToPlanet2Room(userId));
      }, BASE_RECONNECT_DELAY * planet2ReconnectAttempts);
    } else {
      dispatch(connectFailure('Не удалось переподключиться к planet2.'));
    }
  }
};

export const connectToPlanet3Room = (userId: string) => async (dispatch: any) => {
  try {
    const room = await colyseusClient.joinOrCreate('planet3', { userId });
    planet3ReconnectAttempts = 0;
    dispatch(connectPlanet3Success((room as any).id));
    // room.onMessage('*', (type: string | number, message: any) => {
    //   console.log('Planet3Room message:', type, message);
    // });
    room.onMessage('planetPlayers', (players) => {
      // обновить локальный state всех игроков на планете
    });
    const reconnect = () => {
      if (planet3ReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        planet3ReconnectAttempts++;
        setTimeout(() => {
          dispatch(connectToPlanet3Room(userId));
        }, BASE_RECONNECT_DELAY * planet3ReconnectAttempts);
      } else {
        dispatch(connectFailure('Не удалось переподключиться к planet3.'));
      }
    };
    room.onLeave((code) => {
      console.log('Left planet3 room with code:', code);
      if (code === 1006) {
        reconnect();
      } else {
        dispatch(disconnect());
      }
    });
    room.onError?.((code: any, message: any) => {
      console.warn('Room, onError (planet3):', code, message);
      reconnect();
    });
  } catch (error: any) {
    planet3ReconnectAttempts++;
    if (planet3ReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        dispatch(connectToPlanet3Room(userId));
      }, BASE_RECONNECT_DELAY * planet3ReconnectAttempts);
    } else {
      dispatch(connectFailure('Не удалось переподключиться к planet3.'));
    }
  }
};

export const disconnectFromRoom = (roomName: string) => async (dispatch: any) => {
  try {
    dispatch(disconnect());
  } catch (error: any) {
    console.error('Error disconnecting from room:', error);
    dispatch(connectFailure(error.message));
  }
};

export default webSocketSlice;
