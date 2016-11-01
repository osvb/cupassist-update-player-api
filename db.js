/* flow */
import axios from 'axios'
import { debugOk, debugError, debugComplete, log } from './helpers'

const PLAYER_API = process.env.PLAYER_API

export default function insertIntoDB(player) {
  return axios
    .post(`${PLAYER_API}/`, player)
    .then(debugOk)
    .catch(debugError)
}
