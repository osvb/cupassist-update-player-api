import { mutate, query } from "../utils/client";

export function create(player1, player2) {
  // TODO: check if team exist before? or is that done?
  // TODO/NOTE: order of players do not matter from a technical point of view. does it matter do anyone else?
  // TODO: checke syntaks på players....
  return mutate(`{
        createTeam (
            name: "${teamAndPlayerId(player1, player2)}"
            color: "blue"
            logo: "http://volleystream.no/static/default-beach-team-logo.png"
            shortName: "${teamAndPlayerId(player1, player2)}"
            slug: "${teamNavnSlug(player1, player2)}"
        ) {
            name
            id
        } 
    }
    `);
}

export async function addPlayerToTeam(teamId, player1Id, player2Id) {
  return mutate(`{
        addPlayer1: addToTeamPLayer(${teamId}, ${player1Id})
        addPlayer2: addToTeamPLayer(${teamId}, ${player2Id})
    }`);
}

export async function allTeams() {
  const queryResult = query(`
    {
        allTeams {
            name
            id
        }
    }
    `);
  return (await queryResult).allTeams;
}

export function teamAndPlayerId(player1, player2) {
  const [first, second] = [player1.id, player2.id].sort();
  if(!first || !second) {
      throw Error('id finnes ikke på en spiller!', first, second)
  }
  console.log(`${first}-${second}`)
  return `${first}-${second}`;
}

export function teamNavnSlug(player1, player2) {
  const [first, second] = [player1, player2].sort(compareFnPlayer);
  return `${first.firstChar}${first.lastname}${second.firstChar}${second.lastname}`;
}

function compareFnPlayer(player1, player2) {
    return `${player1.lastname} ${player1.firstChar}` > `${player2.lastname} ${player2.firstChar}`
  }
  