export const pvpSocketEvents = {
  client: {
    requestRooms: 'pvp:lobby:rooms',
    createRoom: 'pvp:room:create',
    joinRoom: 'pvp:room:join',
    leaveRoom: 'pvp:room:leave',
    setReady: 'pvp:room:ready',
    updateSettings: 'pvp:room:settings',
    startMatch: 'pvp:match:start',
    updateProgress: 'pvp:match:progress',
    finishMatch: 'pvp:match:finish',
  },
  server: {
    rooms: 'pvp:lobby:update',
    roomState: 'pvp:room:state',
    matchState: 'pvp:match:state',
    error: 'pvp:error',
  },
} as const
