/* eslint-env browser */
const NO_CONNECTION = null

export default createWebsocketMiddleware

export const ActionTypes = {
  WEBSOCKET_CONNECTED: '@@redux-websocket/WEBSOCKET_CONNECTED',
  WEBSOCKET_DISCONNECTED: '@@redux-websocket/WEBSOCKET_DISCONNECTED',
  WEBSOCKET_ERROR: '@@redux-websocket/WEBSOCKET_ERROR',
  RECEIVED_WEBSOCKET_DATA: '@@redux-websocket/RECEIVED_WEBSOCKET_DATA'
}

export function createWebsocketMiddleware (options = {}) {
  const connections = {}

  return function (store) {
    if (options.defaultEndpoint) {
      setupSocket(options.defaultEndpoint)
    }

    return function (next) {
      return function (action) {
        if (!isSocketAction(action)) {
          return next(action)
        }

        const endpoint = action.meta.socket

        const connection = getConnection(endpoint)

        if (connection === NO_CONNECTION && !options.defaultEndpoint) {
          throw new Error(undefinedEndpointErrorMessage(action))
        }

        if (action.meta.incoming) {
          return next(action)
        } else {
          const { message } = action.payload
          connection.socket.send(message)
        }
      }
    }

    function setupSocket (endpoint) {
      const connection = {
        endpoint: endpoint,
        socket: new WebSocket(endpoint),
        queue: []
      }

      connections[endpoint] = connection

      connection.onmessage(function (data) {
        store.dispatch(createMessageAction(endpoint, data))
      })

      connection.onopen(function () {
        store.dispatch(createConnectionAction(endpoint))
      })

      connection.onclose(function () {
        store.dispatch(createDisonnectionAction(endpoint))
      })

      connection.onerror(function (error) {
        store.dispatch(createErrorAction(endpoint, error))
      })

      return connection
    }

    function getConnection (endpoint) {
      switch (typeof endpoint) {
        case 'string':
          if (connections[endpoint]) {
            return connections[endpoint]
          }
          return setupSocket(endpoint)
        case 'boolean':
          return connections[options.defaultEndpoint]
        default:
          return setupSocket(endpoint)
      }
    }
  }
}

export function isSocketAction (action) {
  return Boolean(action && action.meta && action.meta.socket) && [
    ActionTypes.WEBSOCKET_CONNECTED,
    ActionTypes.WEBSOCKET_DISCONNECTED,
    ActionTypes.RECEIVED_WEBSOCKET_DATA,
    ActionTypes.WEBSOCKET_ERROR
  ].indexOf(action.meta.socket) > -1
}

function createConnectionAction (endpoint) {
  return {
    type: ActionTypes.WEBSOCKET_CONNECTED,
    meta: { websocket: endpoint }
  }
}

function createDisonnectionAction (endpoint) {
  return {
    type: ActionTypes.WEBSOCKET_DISCONNECTED,
    meta: { websocket: endpoint }
  }
}

function createErrorAction (endpoint, error) {
  return {
    type: ActionTypes.WEBSOCKET_ERROR,
    payload: new Error(error),
    meta: { websocket: endpoint, error: true }
  }
}

function createMessageAction (endpoint, data) {
  return {
    type: ActionTypes.RECEIVED_WEBSOCKET_DATA,
    payload: data,
    meta: { websocket: endpoint }
  }
}

function undefinedEndpointErrorMessage (action) {
  return `Whoops! You tried to dispatch an action to a socket instance that
  doesn't exist, as you didn't specify an endpoint in the action itself:

  ${JSON.stringify(action, null, 4)}

  Or you didn't set the 'defaultEndpoint' config option when creating your
  middleware instance.`
}
