import 'whatwg-fetch'
import { ipcRenderer } from 'electron'

export const toJson = (res) => res.json()

export const checkStatus = (res) => {
  const { status } = res
  if (status >= 200 && status < 300) { return res }
  return Promise.reject(new Error(res.statusText || res.status))
}

export const makeApiRequest = (url, options = {}) => {
  let defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }

  if (options.hasOwnProperty('headers') && options.headers['Content-Type']) {
    delete defaultHeaders['Content-Type']
  }

  if (options.hasOwnProperty('headers') && options.headers['Accept']) {
    delete defaultHeaders['Accept']
  }

  options = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  return fetch(url, options).then(checkStatus).then(toJson)
}

export const sendIpcMessage = (type, args, returnValue=null) => {
  return new Promise((resolve, reject) => {
    console.log(`IPC SEND: ${type} - ${args}`)
    ipcRenderer.send(type, args)
    resolve(returnValue)
  })
}
