import { mutate, query } from "./client";

export function create(tournamentId, teamId) {
  // TODO: everyting here
  return mutate(`{
        createSignups (
            tournamentId: "${tournamentId}"
            teamId: "${teamId}" 
        ) {
            team: {
                name
            }
            tournament: {
                name
            }
        }
    }
    `);
}
