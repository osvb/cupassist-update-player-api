/**
 * Takes the rankingsystem used on the norwegian tour and puts it into a grapqlbackend. 
 * more precis graph.cool database.
 * To reuse it you need to add your own token to =>  process.env.TOKEN.
 * And the url should be changed if your are not running this against the same database as I was.
 */

/**
 * Assums this backend:

 type BeachVolleyballRankingStructure implements Node {
  id: ID! @isUnique
  place: Int!
  type: BeachVolleyballTournamentType @relation(name: "BeachVolleyballRankingStructureBeachVolleyballTournamentType")
  points: Int!
}

type BeachVolleyballTournamentType implements Node {
  id: ID! @isUnique
  type: String! @isUnique
  ageLevel: AgeLevel! @relation(name: "BeachVolleyballTournamentTypeAgeLevel")
  beachVolleyballRankingStructures: [BeachVolleyballRankingStructure!]! @relation(name: "BeachVolleyballRankingStructureBeachVolleyballTournamentType")
}
*/

import { mutate } from "./client";

const {
  FIVB_FIVE_POINTS_STARS_POINTS,
  FIVB_FOUR_POINTS_STARS_POINTS,
  FIVB_THREE_STARS_POINTS,
  FIVB_TWO_STARS_POINTS,
  FIVB_ONE_STAR_POINTS,
  LT_POINTS,
  RT_OPEN_POINTS,
  RT_MASTER_POINTS,
  NT_OPEN_POINTS,
  NT_MASTER_POINTS,
  NM_POINTS
} = require("./rankingpoints");

const pointsLevels = {
  LT: LT_POINTS,
  "RT Open": RT_OPEN_POINTS,
  "RT Master": RT_MASTER_POINTS,
  "NT Open": NT_OPEN_POINTS,
  "NT Master": NT_MASTER_POINTS,
  NM: NM_POINTS,
  "FIVB 1 stjerners": FIVB_ONE_STAR_POINTS,
  "FIVB 2 stjerners": FIVB_TWO_STARS_POINTS,
  "FIVB 3 stjerners": FIVB_THREE_STARS_POINTS,
  "FIVB 4 stjerners": FIVB_FIVE_POINTS_STARS_POINTS,
  "FIVB 5 stjerners": FIVB_FIVE_POINTS_STARS_POINTS
};

function main() {
  const keys = Object.keys(pointsLevels);
  const ids = [];

  for (const key in pointsLevels) {
    console.log(key);
    createBeachVolleyballTournamentType(key);
  }
}

function createBeachVolleyballTournamentType(type) {
  return mutate(
    `
    {
        createBeachVolleyballTournamentType (
        type: "${type}"
        ageLevelId: "cj81x3lmqi8xp01510rfy41qp"
      ) {
        id
        type
      }
    }
  `
  ).then(value => {
    const { id, type } = value.createBeachVolleyballTournamentType;
    const pointsAndPlaces = pointsLevels[type];
    pointsAndPlaces.forEach(pointsAndPlaces => {
      const [place, points] = pointsAndPlaces;
      createBeachVolleyballRankingStructure(place, points, id);
    });
  });
}

function createBeachVolleyballRankingStructure(place, points, typeId) {
  console.log(place, points, typeId);
  return client.mutate(
    `
      {
        createBeachVolleyballRankingStructure (
          points: ${points}
          place: ${place}
          typeId: "${typeId}"
        ) {
          id
        }
      }
    `
  );
}

main();
