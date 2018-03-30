/**
 * @providesModule RCTNetworking
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";

import RCTEventEmitter from "RCTNativeEventEmitter";

type DataTypeString = { string: string };
type DataTypeUri = { uri: string };
type DataTypeFormData = { formData: string[] };
type DataTypeBlob = { blob: Object };

type DataType = DataTypeString | DataTypeUri | DataTypeFormData | DataTypeBlob;

type RCTRequest = {
  data: DataType,
  headers: Object,
  incrementalUpdates: boolean,
  method: string,
  responseType: "base64" | "blob" | "text",
  timeout: number,
  url: string,
  withCredentials: boolean
};

type RCTHttpRequest = XMLHttpRequest & { requestId: number };

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

@RCT_EXPORT_MODULE("RCTNetworking")
export default class RCTNetworking extends RCTEventEmitter {
  requestStore: { [id: number]: RCTHttpRequest } = {};

  constructor(bridge: RCTBridge) {
    super(bridge, [
      "didCompleteNetworkResponse",
      "didReceiveNetworkResponse",
      "didSendNetworkData",
      "didReceiveNetworkIncrementalData",
      "didReceiveNetworkDataProgress",
      "didReceiveNetworkData"
    ]);
  }

  sendData(request: RCTHttpRequest, responseType: string) {
    let responseData: any = "";

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
    console.log("didReceiveNetworkResponse", responseJSON);
    this.sendEventWithName("didReceiveNetworkResponse", responseJSON);
  };

  handleLoad = (request: RCTHttpRequest, responseType: string) => () => {
    this.sendData(request, responseType);

    // requestId, errorDescription, timed-out
    const completeJSON = [request.requestId, null, false];
    this.sendEventWithName("didCompleteNetworkResponse", completeJSON);
    delete this.requestStore[request.requestId];
  };

  handleError = (request: RCTHttpRequest) => () => {};

  handleAbort = (request: RCTHttpRequest) => () => {};

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  sendRequest(query: RCTRequest, callbackId: number) {
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

    req.addEventListener("load", this.handleLoad(req, responseType));
    req.addEventListener("loadend", this.handleLoadEnd(req));

    Object.entries(headers).forEach(([header, value]: [string, any]) => {
      req.setRequestHeader(header, value);
    });

    if (data.string) {
      const body = data.string;
      req.send(body);
    }

    this.bridge.callbackFromId(callbackId)(requestId);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  abortRequest(requestId: number) {
    console.log("abortRequest", requestId);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  clearCookies(callbackId: number) {
    console.log("clearCookies", callbackId);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  addListener(eventName: string, callback: ?(body: any) => void) {
    super.addListener(eventName, callback);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  removeListeners(count: number) {
    super.removeListeners(count);
  }
}
