/* @flow */
import debug from "debug";

export const log = debug("cupassist-update-player-api");
export const debugError = debug("error");
export const debugOk = debug("ok");
export const debugComplete = debug("Complete");

export function addField(object: Object, newObject: Object) {
  return Object.assign({}, object, newObject);
}
