import { mutate, query } from "./client";

export function allTournaments() {
  return query(`
    {
        allTournaments() {
            name
            id
            cuppassistBeachId
            cuppassistBeachName
        }
    }
    `);
}
