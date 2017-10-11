import { query, mutate } from "../utils/client";

query(`
{ 
    allPlayers(filter: { cuppassistBeachId_not: null } ) {
      name
      id
    }
  }`)
  .then(results => {
    results.allPlayers.forEach(player => {
      deletePlayer(player.id);
    });
  })
  .catch(err => console.log("err", err));

function deletePlayer(id) {
  mutate(`{ 
        deletePlayer(id: "${id}") {
          name
          id
        }
      }`);
}
