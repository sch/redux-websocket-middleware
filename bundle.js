'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const NO_CONNECTION = null;

const ActionTypes = {
  SOCKET_CONNECTED: "@@redux-socket/SOCKET_CONNECTED",
  SOCKET_DISCONNECTED: "@@redux-socket/SOCKET_DISCONNECTED",
  DATA_RECEIVED: "@@redux-socket/DATA_RECEIVED",
};

function createSocketMiddleware (options = {}) {
  const connections = {};
  window.connections = connections;

  return function (store) {
    if (options.defaultEndpoint) {
      setupSocket(options.defaultEndpoint);
    }

    return function (next) {
      return function (action) {
        if (!isSocketAction(action)) {
          return next(action)
        }

        const socketEndpoint = action.meta.socket;

        const connection = getConnection(socketEndpoint);

        if (connection === NO_CONNECTION && !options.defaultEndpoint) {
          throw new Error(undefinedEndpointErrorMessage(action))
        }

        if (action.meta.incoming) {
          return next(action)
        } else {
          console.log("Sending...", action);
          const { messageType, message } = action.payload;
          connection.socket.emit(messageType, message);
        }
      }
    }

    function setupSocket (socketEndpoint) {
      const connection = {
        endpoint: socketEndpoint,
        type: "socket.io",
        socket: new WebSocket(socketEndpoint),
        queue: [],
      };

      connections[socketEndpoint] = connection;

      connection.socket.on("message", handleMessage);
      connection.socket.on("connect", handleConnect);
      connection.socket.on("disconnect", handleDisconnect);
      connection.socket.on("error", console.warn.bind(console));

      return connection

      function handleMessage (data) {
        console.log("MESSAGE", data);
        const action = createMessageAction(socketEndpoint, JSON.parse(data));
        store.dispatch(action);
      }

      function handleConnect () {
        const action = createConnectionAction(socketEndpoint);
        store.dispatch(action);
      }

      function handleDisconnect () {
        const action = createDisonnectionAction(socketEndpoint);
        store.dispatch(action);
      }
    }

    function getConnection (socketEndpoint) {
      switch (typeof socketEndpoint) {
        case "string":
          if (connections[socketEndpoint]) {
            return connections[socketEndpoint]
          }
          return setupSocket(socketEndpoint)
        case "boolean":
          return connections[options.defaultEndpoint]
        default:
          return setupSocket(socketEndpoint)
      }
    }
  }
}

function isSocketAction (action) {
  return Boolean(action && action.meta && action.meta.socket)
}

function createConnectionAction (socketEndpoint) {
  return {
    type: ActionTypes.SOCKET_CONNECTED,
    meta: { socket: socketEndpoint, incoming: true }
  }
}

function createDisonnectionAction (socketEndpoint) {
  return {
    type: ActionTypes.SOCKET_DISCONNECTED,
    meta: { socket: socketEndpoint, incoming: true }
  }
}

function createMessageAction (socketEndpoint, data) {
  return {
    type: ActionTypes.DATA_RECEIVED,
    payload: data,
    meta: { socket: socketEndpoint, incoming: true }
  }
}

function undefinedEndpointErrorMessage (action) {
  [
    "Whoops! You tried to dispatch an action to a socket instance that ",
    "doesn't exist, as you didn't specify an endpoint in the action itself:",
    "\n\n", JSON.stringify(action, null, 4), "\n\nOr you didn't set the ",
    "defaultEndpoint config option when creating your middleware instance.",
  ].join("");
}

exports.ActionTypes = ActionTypes;
exports.createSocketMiddleware = createSocketMiddleware;
exports.isSocketAction = isSocketAction;
