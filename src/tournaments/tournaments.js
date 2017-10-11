import { mutate, query } from "./../utils/client";

export async function allTournaments() {
  const tournamentsResult = await query(`
    {
        allBeachVolleyballTournamentses {
            name
            id
            cupassistBeachName
            cupassistTournamentId
        }
    }
    `);

  return tournamentsResult.allBeachVolleyballTournamentses;
}
