/** @flow */

import invariant from "invariant";

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

class RCTWebSocketModule extends RCTEventEmitter {
  static moduleName = "RCTWebSocketModule";

  sockets: { [id: string]: WebSocket };

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.sockets = {};
  }

  /**
   * Establish a connection and associate with socketID. socketID is used for future
   * communication with React
   * @param url - string Url to connect to
   * @param protocols - protocols for creating the WebSocket instance
   * @param options - currently unused
   * @param socketId - ID used to represent this connection in React
   */
  $connect(
    url: string,
    protocols: string | Array<string>,
    options: any,
    socketId: number
  ) {
    const socket = protocols
      ? new WebSocket(url, protocols)
      : new WebSocket(url);
    socket.binaryType = "arraybuffer";
    this.sockets[String(socketId)] = socket;

    // set the onclose, onerror and onmessage functions so that the
    // React event can be dispatched
    socket.onclose = (event) => {
      const payload = {
        id: socketId,
        code: event.code,
        reason: event.reason
      };
      this.bridge.enqueueJSCall("RCTDeviceEventEmitter", "emit", [
        "websocketClosed",
        payload
      ]);
    };
    socket.onerror = (event) => {
      const payload = {
        id: socketId,
        message: "Native WebSocket error"
      };
      this.bridge.enqueueJSCall("RCTDeviceEventEmitter", "emit", [
        "websocketFailed",
        payload
      ]);
    };
    socket.onmessage = (event) => {
      let data = event.data;
      if (data instanceof ArrayBuffer) {
        // Convert arraybuffer to string because the current bridge format is
        // automatically stringified to account for metadata and to speed up
        // older versions of Blink. We may be able to avoid this indirection
        // later on.
        const arr = new Uint8Array(data);
        const str = new Array(arr.byteLength);
        for (let i = 0; i < str.length; i++) {
          str[i] = String.fromCharCode(arr[i]);
        }
        data = btoa(str.join(""));
      }
      const payload = {
        id: socketId,
        type: typeof event.data === "string" ? "string" : "binary",
        data: data
      };
      this.bridge.enqueueJSCall("RCTDeviceEventEmitter", "emit", [
        "websocketMessage",
        payload
      ]);
    };
    socket.onopen = (event) => {
      const payload = {
        id: socketId
      };
      this.bridge.enqueueJSCall("RCTDeviceEventEmitter", "emit", [
        "websocketOpen",
        payload
      ]);
    };
  }

  /**
   * internal function to send the data
   * maps the React socketID to the instance of WebSocket
   */
  _send(data: string | ArrayBuffer, socketId: number) {
    const socket = this.sockets[String(socketId)];
    if (!socket) {
      throw new Error("Error while sending data to WebSocket: no such socket");
    }
    socket.send(data);
  }

  /**
   * send
   * function called by the React code through messages
   * @param data - data from react
   * @param socketId - React socket id
   */
  $send(data: string, socketId: number) {
    this._send(data, socketId);
  }

  /**
   * sendBinary
   * function called by the React code through messages
   * @param data - data from react
   * @param socketId - React socket id
   */
  $sendBinary(data: string, socketId: number) {
    const chars = atob(data);
    const array = new Uint8Array(chars.length);
    for (let i = 0; i < chars.length; i++) {
      array[i] = chars.charCodeAt(i) & 255;
    }
    this._send(array.buffer, socketId);
  }

  /**
   * ping
   * Unsupported in WebVR due to
   * "Cannot send a ping. Browser WebSocket APIs are not capable of sending specific opcodes"
   * @param socketId - React socket id
   */
  $ping(socketId: number) {
    throw new Error(
      "Cannot send a ping. Browser WebSocket APIs are not capable of sending specific opcodes"
    );
  }

  /**
   * close
   * function called by the React code through messages
   * @param codeOrId - if reason is undefined or sockedId is undefined this is id, otherwise
   *                   it is the code to report to the websocket
   * @param reason - reason distributed to WebSocket close, maybe undefined
   * @param socketId - React socket id or maybe undefined in which codeorID contains the socket
   */
  $close(codeOrId: number, reason: void | string, socketId: void | number) {
    let id;
    if (typeof reason !== "undefined" && typeof socketId !== "undefined") {
      id = String(socketId);
      const socket = this.sockets[id];
      if (!socket) {
        return;
      }
      socket.close(codeOrId, reason);
    } else {
      id = String(codeOrId);
      const socket = this.sockets[id];
      if (!socket) {
        return;
      }
      socket.close();
    }
    delete this.sockets[id];
  }
}

export default RCTWebSocketModule;
