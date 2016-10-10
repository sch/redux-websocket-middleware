/* eslint-env mocha */

const { Server } = require('mock-socket')
const { createWebsocketMiddleware } = require('../dist/redux-websocket-middleware')

describe('WebsocketMiddleware', (done) => {
  const websocketMiddleware = createWebsocketMiddleware()
  const nextHandler = websocketMiddleware({
    dispatch () {},
    getState () {}
  })

  it('opens a socket for an action with a "websocket" meta field', () => {
    const mockServer = new Server('ws://localhost:8080')

    mockServer.on('connection', server => done())
    nextHandler({
      type: 'CONNECT',
      meta: { websocket: 'ws://localhost:8080' }
    })
  })
})
