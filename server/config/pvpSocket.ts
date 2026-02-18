export const pvpSocketEvents = {
  client: {
    requestRooms: 'pvp:lobby:rooms',
    createRoom: 'pvp:room:create',
    joinRoom: 'pvp:room:join',
    leaveRoom: 'pvp:room:leave',
    setReady: 'pvp:room:ready',
    updateSettings: 'pvp:room:settings',
    resetRoom: 'pvp:room:reset',
    destroyRoom: 'pvp:room:destroy',
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

export const rankedSocketEvents = {
  client: {
    joinQueue: 'ranked:queue:join',
    cancelQueue: 'ranked:queue:cancel',
    progress: 'ranked:progress',
    finish: 'ranked:finish',
  },
  server: {
    searchStatus: 'ranked:search:status',
    matchFound: 'ranked:match:found',
    matchState: 'ranked:match:state',
    result: 'ranked:result',
    error: 'ranked:error',
  },
} as const
