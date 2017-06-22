export function isSocketAction (action) {
  return Boolean(action && action.meta && action.meta.socket)
}

export function isIncomingMessage (action) {
  return Boolean(action && action.meta && action.meta.incoming)
}

export function undefinedEndpointErrorMessage (action) {
  return `Whoops! You tried to dispatch an action to a socket instance that
  doesn't exist, as you didn't specify an endpoint in the action itself:

  ${JSON.stringify(action, null, 4)}

  Or you didn't set the 'defaultEndpoint' config option when creating your
  middleware instance.`
}

export function encodeMessage (message) {
  switch (typeof message) {
    case 'object':
      return JSON.stringify(message)
    default:
      return message
  }
}

export function decodeMessage (message) {
  try {
    return JSON.parse(message)
  } catch (e) {
    return message
  }
}
