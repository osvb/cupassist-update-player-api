import lodash from "lodash";
import cheerio from "cheerio";
import cheerioTableparser from "cheerio-tableparser";
import moment from "moment-timezone";
const superagent = require("superagent");
const a = superagent.agent();
const { query, mutate } = require("./client");

import { allTeams, create as createTeam } from "./teams";
import { create as createSignup } from './signups'

const htmlParseOption = {
  normalizeWhitespace: false,
  xmlMode: false,
  decodeEntities: true
};

const mapToTournamentUrl = id =>
  `https://www.profixio.com/matches/abt_senior_1_17/l`;

// https://www.profixio.com/pamelding/vis_paamelding.php?ib_id=4319

// https://www.profixio.com/matches/abt_senior_1_17/l
// dropdown med folka

// funker:
// https://www.profixio.com/pamelding/vis_paamelding.php?tknavn=abt_senior_1_17

async function getAllPlayersByGender() {
  return query(`{ 
        females: allPlayers(filter: {gender: FEMALE, cuppassistBeachId: NOT NULL }) {
          name
          id
        }
        males: allPlayers(filter: {gender: MALE }) {
          name
          id
        }
      }
    `);
}

const splitOnGender = team => team.split(/ \(/);

const transformToObject = teamAndGenderArray => ({
  team: teamAndGenderArray[0],
  gender: teamAndGenderArray[1].slice(0, 1)
});

const splitOnPlayers = signup => {
  return {
    team: signup.team.split("/").map(splitOnFirstname),
    gender: signup.gender
  };
};

const splitOnFirstname = name => {
  const [firstname, lastname] = name.split(".");
  return { firstChar: trimLeft(firstname), lastname: trimLeft(lastname) };
};

const onlyMale = team => team.gender === "M";

const onlyFemale = team => team.gender === "F";

const truthyValue = value => !!value && !!value[0] && !!value[1];

const notValidValues = value => !(!!value && !!value[0] && !!value[1]);

const mapGraphqlObjectToPlayerObject = player => {
  const names = player.name.split(" ");
  const firstChar = names[0][0];
  const lastname = names[names.length - 1];
  return Object.assign(player, { firstChar, lastname });
};

const findPlayerWithSameName = (listOfAllPlayers, playerToFind) => {
  const playersFound = listOfAllPlayers.filter(
    player =>
      player.firstChar === playerToFind.firstChar &&
      player.lastname === playerToFind.lastname
  );

  if (playersFound.length > 1) {
    console.log("Duplicate found for player", playersFound);
    console.log("Using first and moving on", playersFound[0]);
  }
  if (playersFound.length === 0) {
    console.log("No player found for this player", playerName);
    return {};
  }
  return playersFound[0];
};

const addGraphqlId = (players, signup) => {
  return signup.team.map(player => {
    const graphQlPlayer = findPlayerWithSameName(players, player);
    return Object.assign({}, signups, { id: graphQlPlayer.id });
  });
};

async function main() {
  try {
    const playersByGender = await getAllPlayersByGender();
    const tournaments = await allTournaments()
    const allTeams = await allTeams();
    console.log(Object.keys(playersByGender));
    const males = playersByGender.males.map(mapGraphqlObjectToPlayerObject);
    const females = playersByGender.females.map(mapGraphqlObjectToPlayerObject);
    console.log(males.length, females.length);

    tournaments.forEach(tournament => {
      const url = mapToTournamentUrl(4319);
      const text = await getUrl(url);
      const $ = cheerio.load(text);
      const select = $("#lag_choice");
      const teamsAsText = select.text().split(/\n/);
  
      teamsAsText
        .map(splitOnGender)
        .filter(notValidValues)
        .forEach(value => console.log("not valid", value));
  
      // const structurOfsignups = [
      //   { gender: "M|K", team: { firstChar: "S", lastname: "Svendby" } }
      // ];
      const signups = teamsAsText
        .map(splitOnGender)
        .filter(truthyValue)
        .map(transformToObject)
        .map(splitOnPlayers);
  
      const maleSignups = signups
        .filter(onlyMale)
        .map(addGraphqlId.bind(null, males));
  
      const femaleSignups = signups
        .filter(onlyFemale)
        .map(addGraphqlId.bind(null, females));
  
      const allSignups = femaleSignups.concat(...maleSignups);
  
      const signupsWithTeamId = await enforceTeamId(allSignups);
      signupsWithTeamId.map(createSignup.bind(null, tournament.id));
    })

  } catch (err) {
    console.log("err", err);
  }
}

// main();

async function enforceTeamId(signup, allTeams) {
  const teamNameToLookFor = teamNavn(signup.team);
  const team = lodash.first(
    allTeams,
    team => team.name === teamNavn(signup.team)
  );
  if (team) {
    signup.teamId = team.id;
  } else {
    //team not found lets create it!
    const newTeam = await createTeam(...signup.team);
    signup.teamId = newTeam.id;
  }
  return signup;
}

function getUrl(url) {
  return new Promise((resolve, reject) => {
    a.get(url).end((err, res) => {
      if (err) reject(err);
      else resolve(res.text);
    });
  });
}

function trimLeft(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  if (text[0] === " ") {
    return trimLeft(text.slice(1));
  }
  return text;
}

co;
