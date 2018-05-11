/**
 * @providesModule RCTBlobManager
 * @flow
 */

import cuid from "cuid";
import invariant from "invariant";

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";
import type {
  RCTHttpRequest,
  RCTNetworkingRequestHandler,
  RCTNetworkingResponseHandler
} from "RCTNetworkingNative";

const kBlobURIScheme = "blob";

@RCT_EXPORT_MODULE("BlobModule")
class RCTBlobManager
  implements RCTNetworkingRequestHandler, RCTNetworkingResponseHandler {
  bridge: RCTBridge;
  blobs: { [key: string]: Blob };

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
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

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  addNetworkingHandler() {
    this.bridge.networking.addRequestHandler(this);
    this.bridge.networking.addResponseHandler(this);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  release(blobId: string) {
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
