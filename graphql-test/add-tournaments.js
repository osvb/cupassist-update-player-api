/**
 * To run this file and import into the database run:
*        DEBUG="*,-babel,-follow-redirects" CUPASSIST_API="https://api.osvb.no" TOKEN="<insert-token-here>" node_modules/.bin/babel-node graphql-test/add-tournaments.js
 * from the repos top folder.
 */

import lodash from "lodash";
import cheerio from "cheerio";
import cheerioTableparser from "cheerio-tableparser";
import moment from "moment-timezone";
const superagent = require("superagent");
const a = superagent.agent();
const { mutate } = require("./client");

const htmlParseOption = {
  normalizeWhitespace: false,
  xmlMode: false,
  decodeEntities: true
};

function main() {
  a
    .get("https://profixio.com/fx/login.php?login_public=NVBF.NO.SVB")
    .end(requestTournament);
}

function requestTournament() {
  var ids = a
    .get("https://profixio.com/fx/terminliste.php?vis_gamle_arr=true")
    .end(getTournmanetIds);
}

const mapToTournamentUrl = id =>
  `https://profixio.com/fx/vis_innbydelse.php?ib_id=${id}`;
const parseIdFromUrl = link => link.match(/ib_id=([0-9]*)/)[1];

const ROW_WITH_TOURNAMENT_LINKS = 4;

function getTournmanetIds(err, res) {
  if (err) {
    throw err;
  }
  const $ = cheerio.load(res.text);
  cheerioTableparser($);
  const tableData = $("table").parsetable();
  console.log(tableData);

  const tournamentLinksWithHeader = tableData[ROW_WITH_TOURNAMENT_LINKS];
  const tournamentLinks = tournamentLinksWithHeader.slice(1);
  const tournamentDetailUrls = tournamentLinks
    .map(parseIdFromUrl)
    .map(mapToTournamentUrl);

  console.log(tournamentDetailUrls);
  tournamentDetailUrls.forEach(handleTournamentDetails);
  //how to get to the signup page from here?
  // jsdom / selenium? or can i have the same approche and parse out some url I can use?
}

main();

function handleTournamentDetails(url, id) {
  a.get(url).end((err, res2) => {
    const $ = cheerio.load(res2.text);
    cheerioTableparser($);
    const tableData = $("table").parsetable();

    const name = tableData[1][1];
    const type = tableData[3][7];

    const $2 = cheerio.load(tableData[1][4]);
    cheerioTableparser($2);
    const tableData2 = $2("table").parsetable();

    const cupassistBeachName = 

    const startDate = moment
      .tz(tableData2[1].join(" "), "DD.MM.YYYY HH.mm", "Europe/Oslo")
      .format();
    const endDate = moment
      .tz(tableData2[3].join(" "), "DD.MM.YYYY HH.mm", "Europe/Oslo")
      .format();

    const databaseMutateQuery = createGrafhQlFormat({
      name,
      startDate,
      endDate,
      type,
      id
    });

    //console.log(databaseMutateQuery, tableData2[1], tableData2[3]);
    mutate(databaseMutateQuery);
  });
}

// Virker:
// https://www.profixio.com/resultater/vis_oppsett.php?id=4319

function createGrafhQlFormat({ name, startDate, endDate, type, id } = {}) {
  return `{
      createBeachVolleyballTournaments (
        name: "${name}"
        startdate: "${startDate}"
        enddate: "${endDate}"
        typeId: "${mapTypeToId(type)}"
        cupassistTournamentId: "${id}"
        cupassistBeachName: ${cupassistBeachName}
      ) {
        name
      }
    }`;
}

function mapTypeToId(cupassistType) {
  if (cupassistType === "Regional") {
    //RT Open
    return "cj82ls190ldp70152c6lm1pkq";
  } else if (cupassistType === "Open") {
    //NT Open
    return "cj82ls18kl6790164n614huro";
  } else if (cupassistType === "Lokal") {
    //LT
    return "cj82lrxp1nex00108gy5sr0i2";
  } else if (cupassistType === "Masters") {
    //RT Master
    return "cj82ls181m8zo012668r1l3np";
  } else {
    //NM
    return "cj82lrxhbly8l015030c1jend";
  }

  //TODO: NT master, and NM need to be done by it self, also all that is tagged NM, but is not NM...

  ("cj82lrxgometo0143mv2b98gz");
  //NT Master
}
