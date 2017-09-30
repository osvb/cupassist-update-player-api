import { mutate, query } from "./client";

export function create(player1, player2) {
  // TODO: check if team exist before? or is that done?
  // TODO/NOTE: order of players do not matter from a technical point of view. does it matter do anyone else?
  // TODO: checke syntaks på players....
  return mutate(`{
        createTeam (
            name: "${teamNavn(player1, player2)}"
            players: [
                { playerId: "${player1.id}" }
                { playerId: "${player2.id}" }
            ]
        ) {
            name
            id
        } 
    }
    `);
}

export function allTeams() {
  return query(`
    {
        allTeams() {
            name
            id
        }
    }
    `);
}

export function teamNavn(player1, player2) {
  const [first, second] = sort([player1, player2]);
  return `${first.firstChar}. ${first.lastname}  - ${second.firstChar}. ${second.lastname} `;
}

function compareFnPlayer(player1, player2) {
  return sort(
    `${player1.lastname} ${player1.firstChar}`,
    `${player2.lastname} ${player2.firstChar}`
  );
}

sort();
