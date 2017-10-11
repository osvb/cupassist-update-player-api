import { query, mutate } from "../utils/client";

export async function allPlayers() {
    return await query(`
    { 
        allPlayers(filter: { cuppassistBeachId_not:  null } ) {
        name
        id
        }
    }`)
}

export async function deletePlayer(id) {
  return await mutate(`{ 
        deletePlayer(id: "${id}") {
          name
          id
        }
      }`);
}


function createGrafhQlFormat(
  {
    name,
    gender,
    number = 1,
    position = "Ukjent",
    height = 0,
    reach = 0,
    blockReach = 0,
    birthYear = 0,
    active = true,
    cuppassistBeachId = "",
    image
  } = {}
) {
  if (!name || !gender) {
    throw new Error("name or gender is not valid");
  }
  return `{
    createPlayer (
        gender: ${gender}
        number: ${number}
        name: "${name}"
        position: "${position}"
        height: ${height}
        reach: ${reach}
        blockReach: ${blockReach}
        birthYear: ${birthYear}
        active: ${active} ${image
    ? `
        image: ${image}`
    : ""}
        cuppassistBeachId: "${cuppassistBeachId}"
    ) {
      name
      id
    }
  }
   `;
}

export async function addPlayer(player) {
  const formated = createGrafhQlFormat(player)
  return await mutate(formated);
}
