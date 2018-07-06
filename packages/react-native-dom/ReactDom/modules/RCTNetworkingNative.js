/** @flow */

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

type DataTypeString = { string: string };
type DataTypeUri = { uri: string };
type DataTypeFormData = { formData: string[] };
type DataTypeBlob = { blob: Object };
type DataTypeBase64 = { base64: string };

type DataType =
  | DataTypeString
  | DataTypeUri
  | DataTypeFormData
  | DataTypeBlob
  | DataTypeBase64;

export type RCTRequest = {
  data: DataType,
  headers: Object,
  incrementalUpdates: boolean,
  method: string,
  responseType: "base64" | "blob" | "text",
  timeout: number,
  url: string,
  withCredentials: boolean
};

export interface RCTNetworkingRequestHandler {
  canHandleNetworkingRequest(data: Object): boolean;
  handleNetworkingRequest(data: Object): Object;
}

export interface RCTNetworkingResponseHandler {
  canHandleNetworkingResponse(responseType: string): boolean;
  handleNetworkingResponse(response: RCTHttpRequest, data: any): Object;
}

export type RCTHttpRequest = XMLHttpRequest & { requestId: number };

function parseHttpHeaders(httpHeaders: ?string) {
  if (httpHeaders == null) return {};
  return httpHeaders
    .split("\n")
    .map((x) => x.split(/: */, 2))
    .filter((x) => x[0])
    .reduce((ac, x) => {
      ac[x[0]] = x[1];
      return ac;
    }, {});
}

let requestIdCounter = 0;

class RCTNetworkingNative extends RCTEventEmitter {
  static moduleName = "RCTNetworking";

  requestStore: { [id: number]: RCTHttpRequest } = {};

  requestHandlers: RCTNetworkingRequestHandler[];
  responseHandlers: RCTNetworkingResponseHandler[];

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.requestHandlers = [];
    this.responseHandlers = [];
  }

  supportedMethods() {
    return [
      "didCompleteNetworkResponse",
      "didReceiveNetworkResponse",
      "didSendNetworkData",
      "didReceiveNetworkIncrementalData",
      "didReceiveNetworkDataProgress",
      "didReceiveNetworkData"
    ];
  }

  sendData(request: RCTHttpRequest, responseType: string) {
    for (const handler of this.responseHandlers) {
      if (handler.canHandleNetworkingResponse(responseType)) {
        const responseData = handler.handleNetworkingResponse(
          request,
          request.response
        );
        return this.sendEventWithName("didReceiveNetworkData", [
          request.requestId,
          responseData
        ]);
      }
    }

    let responseData: any = undefined;
    if (responseType === "text" && typeof request.response === "string") {
      responseData = request.response;
    } else if (
      responseType === "text" &&
      typeof request.response === "object"
    ) {
      responseData = JSON.stringify(request.response);
    } else {
      console.warn(`Invalid responseType ${responseType}`);
      return;
    }

    this.sendEventWithName("didReceiveNetworkData", [
      request.requestId,
      responseData
    ]);
  }

  handleLoadEnd = (request: RCTHttpRequest) => () => {
    const responseURL = request.responseURL;
    const headers = parseHttpHeaders(request.getAllResponseHeaders());
    const status = request.status;

    const responseJSON = [request.requestId, status, headers, responseURL];
    this.sendEventWithName("didReceiveNetworkResponse", responseJSON);
  };

  handleLoad = (request: RCTHttpRequest, responseType: string) => () => {
    this.sendData(request, responseType);

    // requestId, errorDescription, timed-out
    const completeJSON = [request.requestId, null, false];
    this.sendEventWithName("didCompleteNetworkResponse", completeJSON);
    delete this.requestStore[request.requestId];
  };

  handleError = (request: RCTHttpRequest) => () => {
    // TODO: Implement
  };

  handleAbort = (request: RCTHttpRequest) => () => {
    // TODO: Implement
  };

  $sendRequest(query: RCTRequest, callbackId: number) {
    const {
      data,
      method,
      url,
      withCredentials,
      timeout,
      headers,
      responseType
    } = query;

    const requestId = requestIdCounter++;
    const req: RCTHttpRequest = Object.assign((new XMLHttpRequest(): Object), {
      requestId
    });
    this.requestStore[requestId] = req;

    req.open(method, url);
    req.withCredentials = withCredentials;
    req.timeout = timeout;
    req.responseType = responseType;

    req.addEventListener("load", this.handleLoad(req, responseType));
    req.addEventListener("loadend", this.handleLoadEnd(req));

    Object.entries(headers).forEach(([header, value]: [string, any]) => {
      req.setRequestHeader(header, value);
    });

    let body: ?any;
    for (const handler of this.requestHandlers) {
      if (handler.canHandleNetworkingRequest(query)) {
        const { body: tempBody, contentType } = handler.handleNetworkingRequest(
          query
        );
        if (tempBody) {
          body = tempBody;
          req.setRequestHeader("Content-Type", contentType);
          break;
        }
      }
    }

    if (data.string) {
      body = data.string;
    }

    if (data.base64) {
      body = data.base64;
    }

    req.send(body);

    this.bridge.callbackFromId(callbackId)(requestId);
  }

  $abortRequest(requestId: number) {
    // TODO: Implement
    console.log("abortRequest", requestId);
  }

  $clearCookies(callbackId: number) {
    // TODO: Implement
    console.log("clearCookies");
  }

  addRequestHandler(handler: RCTNetworkingRequestHandler) {
    this.requestHandlers.push(handler);
  }

  addResponseHandler(handler: RCTNetworkingResponseHandler) {
    this.responseHandlers.push(handler);
  }

  removeRequestHandler(handler: RCTNetworkingRequestHandler) {
    const index = this.requestHandlers.indexOf(handler);
    if (index !== -1) {
      this.requestHandlers.splice(index, 1);
    }
  }

  removeResponseHandler(handler: RCTNetworkingResponseHandler) {
    const index = this.responseHandlers.indexOf(handler);
    if (index !== -1) {
      this.responseHandlers.splice(index, 1);
    }
  }
}

export default RCTNetworkingNative;
