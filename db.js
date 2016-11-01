/* flow */
import axios from 'axios'
import { debugOk, debugError, debugComplete, log } from './helpers'

const PLAYER_API = "http://localhost:9000/players"

const options =  {
  auth: {
   username: 'admin',
   password: 'admin'
 }
}

export default function insertIntoDB(player) {
  return axios
    .post(`${PLAYER_API}/`, player, options)
    .then(debugOk)
    .catch(debugError)
}
