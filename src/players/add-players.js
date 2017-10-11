/**
 * To run this file and import into the database run:
*        DEBUG="*,-babel,-follow-redirects" CUPASSIST_API="https://api.osvb.no" TOKEN="<insert-token-here>" node_modules/.bin/babel-node graphql-test/add-players.js
 * from the repos top folder.
 */

import lodash from "lodash";
import Promise from "bluebird";

import getCupassistData from "../../cupassist";
import { debugOk, debugError, debugComplete, log } from "../../helpers";
import { mutate } from "./../utils/client";
import { addPlayer } from './players'

if (
  typeof process.env.CUPASSIST_API === "undefined" ||
  process.env.CUPASSIST_API === null
) {
  throw new Error("Please set CUPASSIST_API as a env.var");
}

const CUPASSIST_API = `${process.env.CUPASSIST_API}/ranking`;
const YEARS = [2017];

main();

function main() {
  const urls = lodash.flatten(
    [YEARS].map(populateYearsUrls).map(populateGenderUrls)
  );

  const requestDatas = urls.map(getCupassistData);
  const responses = Promise.all(requestDatas);

  responses
    .then(datas => {
      const players = lodash.flatten(
        datas.filter(object => object !== null).map(extractPlayers)
      );
      const dbFormat = players.map(createDBFormat);
      for(let index in dbFormat) {
        const player = dbFormat[index]
        await addPlayer(player)
      }
    })
    .catch(err => console.log("request failed", err));
}

//////////////////////////////
/** helper functions  */
function createDBFormat(player) {
  return Object.assign(
    {
      cuppassistBeachId: player.cupassistId,
      gender: player.gender === "K" ? "FEMALE" : "MALE"
    },
    lodash.omit(player, ["year", "gender", "points", "cupassistId", "url"])
  );
}

function getPlayerId(object) {
  return object.cupassistId;
}

function extractPlayers(response) {
  return response.data.map(player => {
    return Object.assign({}, lodash.omit(response, "data"), player);
  });
}

function populateYearsUrls(year) {
  return {
    year: year,
    url: `${CUPASSIST_API}/${year}`
  };
}

function populateGenderUrls(object) {
  return [
    Object.assign({}, object, { url: `${object.url}/K`, gender: "K" }),
    Object.assign({}, object, { url: `${object.url}/M`, gender: "M" })
  ];
}

