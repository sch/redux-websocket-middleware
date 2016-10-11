redux-websocket-middleware
==========================

[![build status](https://travis-ci.org/sch/redux-websocket-middleware.svg?branch=master)](https://travis-ci.org/sch/redux-websocket-middleware)

Create actions that dispatch to a websocket. For example:

```js
function writeToSocket(data) {
  return {
    type: "WRITE_DATA",
    payload: data,
    meta: { socket: "ws://echo.websocket.org" }
  }
}
```

That's it!

The middleware handles bookkeeping of connections to the various open sockets, allowing you to focus on sending data and receiving responses. Simply dispatch actions with the `meta: { websocket: <Endpoint> }` property, and the middleware will handle:

- creating and opening the socket
- retrying the connection when lost, and exponentially backing off
- batching writes when offline, and sending when available

Data coming back from the socket will dispatch an action of `"@@redux-websocket/DATA_RECEIVED"` by default. You can listen for this action type in your reducers by importing `ActionTypes`:

```js
import { ActionTypes } from "redux-websocket-middleware"

function reducer (state, action) {
  if (action.type === ActionTypes.DATA_RECEIVED) {
    // ...
  }
}
```

### installation and configuration

The standard redux song-and-dance:

```js
import { applyMiddleware, createStore }
import { createSocketMiddleware } from "redux-websocket-middleware"
import reducer from "./reducer"

const socketMiddleware = createWebsocketMiddleware()

const middleware = applyMiddleware(socketMiddleware)

const store = createStore(reducer, middleware)
```

##### default sockets

If your app only needs to communicate with one socket connection, you can pass a `defaultEndpoint: <Endpoint>` config option when creating the middleware:

```js
import { createWebsocketMiddleware } from "redux-websocket-middleware"

const socketMiddleware = createSocketMiddleware({
  defaultEndpoint: "ws://echo.websocket.org"
})
```

This allows you to treat all actions with the `meta.websocket` property set to `true` as actions that should implicitly use the default socket:

```js
function writeToSocket(data) {
  return {
    type: "WRITE_DATA",
    payload: data,
    meta: { websocket: true }
  }
}
```

### why do it this way

A lot of libraries for managing socket-like interactions in Redux apps create a global listener for their app when instantiating the middleware. You pass in the socket, and then that middleware dispatches actions to the socket according to some property of the action. This leaves you in charge of creating the socket itself, and attaching event handlers to it to listen to your actions outside of your middleware.

The other approach is making some FRPish RxJS/stream based thing that exposes a socket as a kind of subject – something that you can send values to, can produce values, can error, and can end. These all map fairly well to the interface that websockets expose. While this very nicely wraps up event the handling of event listeners, it doesn't help you out in creating the connection or handling reconnection logic or batching requests.

Ultimately a socket connection is about writing data to and reading data from a _place_. This makes for a much more declarative approach and truly reduces the number of things an application author needs to think about. By letting the middleware handle concurrency, the only thing to be concerned with is knowing _where_ to send data, and _where_ to listen from – the socket endpoint doesn't change over the lifetime of the connection.
