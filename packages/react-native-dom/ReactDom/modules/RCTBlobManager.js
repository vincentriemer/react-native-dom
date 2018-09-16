/** @flow */

import cuid from "cuid";
import invariant from "invariant";

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import type {
  RCTHttpRequest,
  RCTNetworkingRequestHandler,
  RCTNetworkingResponseHandler
} from "RCTNetworkingNative";

const kBlobURIScheme = "blob";

class RCTBlobManager extends RCTModule
  implements RCTNetworkingRequestHandler, RCTNetworkingResponseHandler {
  static moduleName = "BlobModule";

  blobs: { [key: string]: Blob };

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.blobs = {};
  }

  constantsToExport() {
    return {
      BLOB_URI_SCHEME: kBlobURIScheme,
      BLOB_URI_HOST: null
    };
  }

  store(data: Blob) {
    const blobId = cuid();
    this.storeWithId(data, blobId);
    return blobId;
  }

  storeWithId(data: Blob, blobId: string) {
    this.blobs[blobId] = data;
  }

  resolve(blob: Object) {
    const blobId: string = blob["blobId"];
    const offset: number = blob["offset"];
    const size: number = blob["size"];
    return this.resolveWithOffsetAndSize(blobId, offset, size);
  }

  resolveURL(url: string) {
    const parsedUrl = new URL(url);
    const blobId = parsedUrl.pathname;
    const offset = parseInt(parsedUrl.searchParams.get("offset"), 10);
    const size = parseInt(parsedUrl.searchParams.get("size"), 10);
    return this.resolveWithOffsetAndSize(blobId, offset, size);
  }

  resolveWithOffsetAndSize(blobId: string, offset: number, size: number) {
    let data = this.blobs[blobId];
    if (!data) {
      return null;
    }
    if (offset != 0 || (size != -1 && size != data.size)) {
      data = data.slice(offset, offset + size);
    }
    return data;
  }

  $addNetworkingHandler() {
    this.bridge.networking.addRequestHandler(this);
    this.bridge.networking.addResponseHandler(this);
  }

  $release(blobId: string) {
    delete this.blobs[blobId];
  }

  canHandleNetworkingRequest(data: Object): boolean {
    return data.blob != null;
  }

  handleNetworkingRequest(data: Object): Object {
    const blob: ?Blob = this.resolve(data.blob);
    invariant(blob, `Could not resolve blob ${data.blob}`);

    let contentType = "application/octet-stream";
    const blobType = blob.type;
    if (blobType != null && blob.size !== 0) {
      contentType = blob.type;
    }
    return { body: blob, contentType };
  }

  canHandleNetworkingResponse(responseType: string): boolean {
    return responseType === "blob";
  }

  handleNetworkingResponse(response: RCTHttpRequest, data: Blob): Object {
    data = data ? data : new Blob();
    return {
      blobId: this.store(data),
      offset: 0,
      size: data.size,
      name: null,
      type: response.getResponseHeader("content-type")
    };
  }
}

export default RCTBlobManager;
