/* eslint-env browser */
import {
  isSocketAction,
  isIncomingMessage,
  undefinedEndpointErrorMessage,
  encodeMessage,
  decodeMessage
} from './utils'

import {
  createConnectionAction,
  createDisonnectionAction,
  createErrorAction,
  createMessageAction
} from './actions'

const NO_CONNECTION = null

export default function createWebsocketMiddleware (options = {}) {
  const connections = {}

  return function (store) {
    if (options.defaultEndpoint) {
      setupSocket(options.defaultEndpoint)
    }

    return function (next) {
      return function (action) {
        if (!isSocketAction(action) || isIncomingMessage(action)) {
          return next(action)
        }

        const endpoint = action.meta.socket

        const connection = getConnection(endpoint)

        if (connection === NO_CONNECTION && !options.defaultEndpoint) {
          throw new Error(undefinedEndpointErrorMessage(action))
        }

        connection.socket.send(encodeMessage(action.payload.message))
      }
    }

    function setupSocket (endpoint) {
      const connection = {
        endpoint: endpoint,
        socket: new WebSocket(endpoint),
        queue: []
      }

      connections[endpoint] = connection

      connection.socket.onmessage = function (e) {
        store.dispatch(createMessageAction(endpoint, decodeMessage(e.data)))
      }

      connection.socket.onopen = function () {
        store.dispatch(createConnectionAction(endpoint))
      }

      connection.socket.onclose = function () {
        store.dispatch(createDisonnectionAction(endpoint))
      }

      connection.socket.onerror = function (error) {
        store.dispatch(createErrorAction(endpoint, error))
      }

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
