/* @flow */

import axios from 'axios'
import { log, addField } from './helpers';

export default function getCupassistData(object: Object) {
  log('cupassist', object.url);
  return axios
    .get(object.url)
    .then(response => addField(object, { data: response.data }))
    .catch(handleError)
}

function handleError(err) {
    log('cupassist:error', err);
    return null;
}
