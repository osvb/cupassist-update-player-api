import lodash from "lodash";
import getCupassistData from "../cupassist";
import { debugOk, debugError, debugComplete, log } from "../helpers";
const Promise = require("bluebird");
const { mutate } = require("./client");

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
      const dbFormat = players.map(createDBFormat).map(createGrafhQlFormat);
      console.log("Lengde:", dbFormat.length);
      dbFormat.forEach(format => {
        mutate(format);
      });
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
    }
  }
   `;
}
