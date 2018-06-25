import GoogleAnalyticsService from '../../../Services/GoogleAnalytics'

import {
  SET_SYSTEM_ERROR
} from '../../../Actions/Core'

import {
  RPC_REQUEST_STARTED,
  RPC_REQUEST_SUCCEEDED,
  RPC_REQUEST_FAILED
} from '../../../Actions/helpers/ReduxWeb3Provider'

export function processPage(pathname, state) {
  const GoogleAnalytics = new GoogleAnalyticsService()
  GoogleAnalytics.setup(state.settings.googleAnalyticsTracking, state.settings.uuid)

  GoogleAnalytics.reportPageview(pathname)
  const segment = pathname.split('/')[1] || 'dashboard'
  GoogleAnalytics.reportScreenview(segment)
}

export function process(action, state) {
  const GoogleAnalytics = new GoogleAnalyticsService()
  GoogleAnalytics.setup(state.settings.googleAnalyticsTracking, state.settings.uuid)

  switch(action.type) {
    case SET_SYSTEM_ERROR: {
      GoogleAnalytics.reportEvent(SystemErrorEvent(action.category, action.detail))
      break;
    }
    case RPC_REQUEST_STARTED: {
      GoogleAnalytics.reportEvent(RPCRequestStartedEvent(action.payload))
      break;
    }
    case RPC_REQUEST_SUCCEEDED: {
      GoogleAnalytics.reportEvent(RPCRequestSucceededEvent(action.payload))

      if (action.result.status === '0x0' || action.result.status == 0) {
        GoogleAnalytics.reportEvent(RPCRequestStatusFailureEvent(action.payload))
      }
      break;
    }
    case RPC_REQUEST_FAILED: {
      GoogleAnalytics.reportEvent(RPCRequestFailedEvent(action.payload))
      break;
    }
  }
}

function SystemErrorEvent(category, detail) {
  let e = {
    category: "error",
    action: category
  }

  if (detail) {
    e.label = detail
  }

  return e
}

function RPCRequestStartedEvent(payload) {
  return {
    category: "rpc",
    action: "started",
    label: payload.method || "(unknown method)",
    value: payload.params ? payload.params.length : 0
  }
}

function RPCRequestSucceededEvent(payload) {
  return {
    category: "rpc",
    action: "succeeded",
    label: payload.method || "(unknown method)"
  }
}

function RPCRequestFailedEvent(payload) {
  return {
    category: "rpc",
    action: "failed",
    label: payload.method || "(unknown method)"
  }
}

function RPCRequestStatusFailureEvent(payload) {
  return {
    category: "error",
    action: "tx-status-failure",
    label: payload.method || "(unknown method)"
  }
}