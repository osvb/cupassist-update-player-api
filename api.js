/* @flow */


export default function isPlayerInPlayerAPI(player) {
  if (!player || !player.cupassistId) {
    debug('unknown player', player)
    return null;
  }
  return getPlayerFromPlayerAPI(player.cupassistId)
  .then(players => {
      if (players.length > 0) {
        log(`Player ${player.name} existing. Updating`);
        return null;
      }
      return player;
    })
}

function getPlayerFromPlayerAPI(externalId) {
  return axios
    .get(`http://localhost:9000/players/search?externalId=${externalId}`)
    .then(req => {
      return req.data;
    });
}
