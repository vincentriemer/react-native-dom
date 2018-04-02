/**
 * @providesModule NetInfo
 * @flow
 */
"use strict";

type NetworkInformationType =
  | "bluetooth"
  | "cellular"
  | "ethernet"
  | "none"
  | "wifi"
  | "wimax"
  | "other"
  | "unknown";

type EffectiveConnectionType = "2g" | "3g" | "4g" | "slow-2g";

const effectiveConnectionTypes = ["2g", "3g", "4g", "slow-2g"];

type NetworkInformation = {
  type: NetworkInformationType,
  effectiveType: EffectiveConnectionType,
  addEventListener: (type: string, handler: Function) => void,
  removeEventListener: (type: string, handler: Function) => void
};

type RCTNetworkInformationType = "none" | "wifi" | "cellular" | "unknown";

type ChangeEventName = "connectionChange" | "change";

const connection: ?NetworkInformation = (navigator.connection ||
  navigator.mozConnection ||
  // $FlowFixMe
  navigator.webkitConnection: any);

function _resolveConnectionInfo(connection: NetworkInformation) {
  let type = connection.type;
  let effectiveType = connection.effectiveType;

  if (type == null && effectiveType != null) {
    type = "wifi";
  }

  switch (type) {
    case "wifi":
    case "cellular":
    case "none":
    case "unknown": {
      break;
    }
    case "bluetooth":
    case "wimax":
    case "ethernet": {
      type = "wifi";
      break;
    }
    case "other":
    default: {
      type = "unknown";
      break;
    }
  }

  if (!effectiveConnectionTypes.includes(effectiveType)) {
    effectiveType = "unknown";
  }

  return { type, effectiveType };
}

function _isConnected(connection) {
  const resolvedConnection = _resolveConnectionInfo(connection);
  return (
    resolvedConnection.type !== "none" && resolvedConnection.type !== "unknown"
  );
}

const _subscriptions = new Map();
const _isConnectedSubscriptions = new Map();

/**
 * NetInfo exposes info about online/offline status.
 *
 * See https://facebook.github.io/react-native/docs/netinfo.html
 */
const NetInfo = {
  /**
   * Adds an event handler.
   *
   * See https://facebook.github.io/react-native/docs/netinfo.html#addeventlistener
   */
  addEventListener(
    eventName: ChangeEventName,
    handler: Function
  ): { remove: () => void } {
    if (connection == null) {
      console.warn("This browser doesn't support the Network Information API");
      return { remove: () => {} };
    }

    const wrappedHandler = () => {
      handler(_resolveConnectionInfo(connection));
    };

    let listener;
    switch (eventName) {
      case "connectionChange": {
        connection.addEventListener("change", wrappedHandler);
        _subscriptions.set(handler, wrappedHandler);
        return {
          remove() {
            NetInfo.removeEventListener(eventName, handler);
          }
        };
      }
      default: {
        console.warn(
          'Trying to subscribe to unknown event: "' + eventName + '"'
        );
        return {
          remove: () => {}
        };
      }
    }
  },

  /**
   * Removes the listener for network status changes.
   *
   * See https://facebook.github.io/react-native/docs/netinfo.html#removeeventlistener
   */
  removeEventListener(eventName: ChangeEventName, handler: Function): void {
    if (connection == null) {
      return;
    }
    const wrappedHandler = _subscriptions.get(handler);
    if (!wrappedHandler) {
      return;
    }
    connection.removeEventListener(eventName, wrappedHandler);
    _subscriptions.delete(handler);
  },

  /**
   * See https://facebook.github.io/react-native/docs/netinfo.html#getconnectioninfo
   */
  getConnectionInfo(): Promise<any> {
    if (connection == null) {
      return Promise.resolve({
        type: "wifi",
        effectiveType: "3g"
      });
    }
    return Promise.resolve(_resolveConnectionInfo(connection));
  },

  fetch(): Promise<any> {
    console.warn(
      "NetInfo.fetch() is deprecated. Use NetInfo.getConnectionInfo() instead."
    );
    return NetInfo.getConnectionInfo().then((res) => res.type);
  },

  /**
   * An object with the same methods as above but the listener receives a
   * boolean which represents the internet connectivity.
   *
   * See https://facebook.github.io/react-native/docs/netinfo.html#isconnected
   */
  isConnected: {
    addEventListener(
      eventName: ChangeEventName,
      handler: Function
    ): { remove: () => void } {
      if (connection == null) {
        return { remove: () => {} };
      }
      const listener = () => {
        handler(_isConnected(connection));
      };
      _isConnectedSubscriptions.set(handler, listener);
      connection.addEventListener("change", listener);
      return {
        remove: () =>
          NetInfo.isConnected.removeEventListener(eventName, handler)
      };
    },

    removeEventListener(eventName: ChangeEventName, handler: Function): void {
      if (connection == null) {
        return;
      }
      const listener = _isConnectedSubscriptions.get(handler);
      if (listener == null) {
        return;
      }
      connection.removeEventListener(eventName, listener);
      _isConnectedSubscriptions.delete(handler);
    },

    fetch(): Promise<any> {
      return NetInfo.getConnectionInfo().then(_isConnected);
    }
  },

  isConnectionExpensive(): Promise<boolean> {
    return Promise.reject(
      "isConnectionExpensive is currently only supported on Android"
    );
  }
};

module.exports = NetInfo;
