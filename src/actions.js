export const ActionTypes = {
  WEBSOCKET_CONNECTED: '@@redux-websocket/WEBSOCKET_CONNECTED',
  WEBSOCKET_DISCONNECTED: '@@redux-websocket/WEBSOCKET_DISCONNECTED',
  WEBSOCKET_ERROR: '@@redux-websocket/WEBSOCKET_ERROR',
  RECEIVED_WEBSOCKET_DATA: '@@redux-websocket/RECEIVED_WEBSOCKET_DATA'
}

export function createConnectionAction (endpoint) {
  return {
    type: ActionTypes.WEBSOCKET_CONNECTED,
    meta: { socket: endpoint, incoming: true }
  }
}

export function createDisonnectionAction (endpoint) {
  return {
    type: ActionTypes.WEBSOCKET_DISCONNECTED,
    meta: { socket: endpoint, incoming: true }
  }
}

export function createErrorAction (endpoint, error) {
  return {
    type: ActionTypes.WEBSOCKET_ERROR,
    payload: new Error(error),
    meta: { socket: endpoint, incoming: true, error: true }
  }
}

export function createMessageAction (endpoint, data) {
  return {
    type: ActionTypes.RECEIVED_WEBSOCKET_DATA,
    payload: data,
    meta: { socket: endpoint, incoming: true }
  }
}
