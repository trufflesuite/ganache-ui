import GoogleAnalyticsService from "../../../../services/GoogleAnalyticsService";

import { SET_SYSTEM_ERROR } from "../../../core/actions";

import {
  RPC_REQUEST_STARTED,
  RPC_REQUEST_SUCCEEDED,
  RPC_REQUEST_FAILED,
} from "../../../web3/helpers/ReduxWeb3Provider";

export function processPage(pathname, state) {
  if (state.config.settings.global) {
    const GoogleAnalytics = new GoogleAnalyticsService();
    GoogleAnalytics.setup(
      state.config.settings.global.googleAnalyticsTracking,
      state.config.settings.global.uuid,
    );

    GoogleAnalytics.reportPageview(pathname);
    const segment = pathname.split("/")[1] || "dashboard";
    GoogleAnalytics.reportScreenview(segment);
  }
}

export function process(action, state) {
  if (state.config.settings.global) {
    const GoogleAnalytics = new GoogleAnalyticsService();
    GoogleAnalytics.setup(
      state.config.settings.global.googleAnalyticsTracking,
      state.config.settings.global.uuid,
    );

    switch (action.type) {
      case SET_SYSTEM_ERROR: {
        GoogleAnalytics.reportEvent(
          SystemErrorEvent(action.category, action.detail),
        );
        break;
      }
      case RPC_REQUEST_STARTED: {
        // Disabled due to hitting Google Analytics over our limits
        // GoogleAnalytics.reportEvent(RPCRequestStartedEvent(action.payload))
        break;
      }
      case RPC_REQUEST_SUCCEEDED: {
        // Disabled due to hitting Google Analytics over our limits
        // GoogleAnalytics.reportEvent(RPCRequestSucceededEvent(action.payload))

        // if (action.result.status === '0x0' || action.result.status == 0) {
        //   GoogleAnalytics.reportEvent(RPCRequestStatusFailureEvent(action.payload))
        // }
        break;
      }
      case RPC_REQUEST_FAILED: {
        // Disabled due to hitting Google Analytics over our limits
        // GoogleAnalytics.reportEvent(RPCRequestFailedEvent(action.payload))
        break;
      }
    }
  }
}

function SystemErrorEvent(category, detail) {
  let e = {
    category: "error",
    action: category,
  };

  if (detail) {
    e.label = detail;
  }

  return e;
}

// function RPCRequestStartedEvent(payload) {
//   return {
//     category: "rpc",
//     action: "started",
//     label: payload.method || "(unknown method)",
//     value: payload.params ? payload.params.length : 0,
//   };
// }

// function RPCRequestSucceededEvent(payload) {
//   return {
//     category: "rpc",
//     action: "succeeded",
//     label: payload.method || "(unknown method)",
//   };
// }

// function RPCRequestFailedEvent(payload) {
//   return {
//     category: "rpc",
//     action: "failed",
//     label: payload.method || "(unknown method)",
//   };
// }

// function RPCRequestStatusFailureEvent(payload) {
//   return {
//     category: "error",
//     action: "tx-status-failure",
//     label: payload.method || "(unknown method)",
//   };
// }
