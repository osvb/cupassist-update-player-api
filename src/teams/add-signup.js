import lodash from "lodash";
import cheerio from "cheerio";
import cheerioTableparser from "cheerio-tableparser";
import moment from "moment-timezone";
import superagent from "superagent";
import { query, mutate } from "./../utils/client";
import { allTournaments } from "./../tournaments/tournaments";
import { teamAndPlayerId, allTeams, create as createTeam, addPlayerToTeam } from "./teams";
import { addPlayer } from './../players/players'
import { create as createSignup } from "./signups";

const a = superagent.agent();

const htmlParseOption = {
  normalizeWhitespace: false,
  xmlMode: false,
  decodeEntities: true
};

const mapToTournamentUrl = name => `https://www.profixio.com/matches/${name}/l`;

// https://www.profixio.com/pamelding/vis_paamelding.php?ib_id=4319

// https://www.profixio.com/matches/abt_senior_1_17/l
// dropdown med folka

// funker:
// https://www.profixio.com/pamelding/vis_paamelding.php?tknavn=abt_senior_1_17

async function getAllPlayersByGender() {
  return query(`{
    females: allPlayers(filter: {AND: [{gender: FEMALE}, {cuppassistBeachId_not: null}]}) {
      name
      id
    }
    males: allPlayers(filter: {gender: MALE}) {
      name
      id
    }
  }`);
}

const splitOnGender = team => {
  const result = team.split(/ \(/);
  const type = typeof team;
  if(result.length !== 2) {
    
    throw Error(`Klarte ikke splitte opp på gender: ${team}, result: ${result}, type: ${type}`)
  }
  return result;
}

const transformToObject = teamAndGenderArray => {
  // Todo, add support for more klasser [G/J]U[15/17/19/21]
  const removeLastSlashIndex = teamAndGenderArray[1].length - 1
  const gender = teamAndGenderArray[1].slice(0, 1)
  if(gender !== "K" && gender !== "M") {
    //console.log(`Unkown gender "${gender}" something is wrong in the parsing of ${teamAndGenderArray}`)
    return null;
  }
  return {
  team: teamAndGenderArray[0],
  gender
  }
};

const splitOnPlayers = signup => {
  return {
    team: signup.team.split("/").map(splitOnFirstname),
    gender: signup.gender
  };
};

const splitOnFirstname = name => {
  const [firstname, lastname] = name.split(".");
  if(firstname.length === 1) {
    return { firstChar: trim(firstname), lastname: trim(lastname), fullName: name};
  } else {
    return parseFullName(name)
  }
};

function parseFullName(name) {
  const names = trim(name).split(" ");
  const firstChar = names[0][0];
  if(firstChar && firstChar.length > 1) {
    throw Error(`firstChar is not of length 1, ${firstChar}, ${JSON.stringify(names)}`)
  }
  const lastname = names[names.length - 1];
  if(!lastname) {
    throw Error(`lastname is falsy, ${lastname}, ${JSON.stringify(names)}`)
  }
  return { firstChar, lastname, fullName: name }
}

const onlyMale = team => team.gender === "M";

const onlyFemale = team => team.gender === "F";

const truthyValue = value => !!value && !!trim(value) && trim(value) !== "Alle"

const mapGraphqlObjectToPlayerObject = player => {
  const name = parseFullName(player.name);
  return Object.assign(player, name);
};

const findPlayerWithSameName = (listOfAllPlayers, playerToFind) => {
  const playersFound = listOfAllPlayers.filter(player => {
    return (
      trim(player.firstChar) === trim(playerToFind.firstChar) &&
      trim(player.lastname) === trim(playerToFind.lastname)
    );
  });

  if (playersFound.length === 0) {
    console.log("No player found for this player", playerToFind);
    return {};
  }
  if (playersFound.length > 1) {
    console.log("Warning: duplicate player, first is:", playersFound[0].fullName, 'Duplicates:', playersFound.length);
  }
  return playersFound[0];
};

const addGraphqlId = async (players, signup) => {
  const team = signup.team.map(player => {
    const graphQlPlayer = findPlayerWithSameName(players, player);
    if(typeof graphQlPlayer.id === "undefined") {
      const gender = signup.gender === 'K' ? 'FEMALE' : 'MALE'
      const response = addPlayer({ name: player.fullName , gender })
      return response.then(playerRes => Object.assign({}, player, { id: playerRes.id }));
    }
    return Promise.resolve(Object.assign({}, player, { id: graphQlPlayer.id }))
  });
  return Promise.all(team).then(teamRes => Object.assign({}, signup, { team: teamRes }))
};

async function main() {
    const tournaments = await allTournaments();
    const playersByGender = await getAllPlayersByGender();
    const males = playersByGender.males.map(mapGraphqlObjectToPlayerObject);
    const females = playersByGender.females.map(mapGraphqlObjectToPlayerObject);
    console.log("males and females array length", males.length, females.length);

    for (let tournament of tournaments) {
      // try {
      const teams = await allTeams();
      console.log('Starting on', tournament.cupassistBeachName, `(https://www.profixio.com/matches/${tournament.cupassistBeachName}/l)`)
      const url = mapToTournamentUrl(tournament.cupassistBeachName);
      const text = await getUrl(url);
      const $ = cheerio.load(text);
      const select = $("#lag_choice");
      const signupsAsText = select.text().split(/\n/);

      // const structurOfsignups = [
      //   { gender: "M|K", team: { firstChar: "S", lastname: "Svendby" } }
      // ];
      const signups = lodash.flatten(
        signupsAsText
          .filter(truthyValue)
          .map(splitOnGender)
          .map(transformToObject)
          .filter(truthyValue)
          .map(splitOnPlayers)
      );

       //console.log("signups", JSON.stringify(signups, null, 2));

       const maleSignups = signups
         .filter(onlyMale)
         .map(addGraphqlId.bind(null, males));

       const femaleSignups = signups
         .filter(onlyFemale)
         .map(addGraphqlId.bind(null, females));

       const allSignupsP = femaleSignups.concat(...maleSignups);

       const allSignups = await Promise.all(allSignupsP)
       const signupsWithTeamId = await enforceTeamId(teams, allSignups);
       signupsWithTeamId.map(createSignup.bind(null, tournament.id));
    // } catch (err) {
    //   console.log("err", err);
    //   console.log(`Skipping the rest of ${tournament.cupassistBeachName}`)
    // }
  }
}

async function enforceTeamId(teams, signups) {
  for (let signupIndex in signups) {
    const signup = signups[signupIndex];
    const teamAndPlayerId2 = teamAndPlayerId(...signup.team);
    const team = lodash.find(teams, team => {
      console.log('checking:', team.name)
      return team.name === teamAndPlayerId2;
    });
    if (team) {
      signup.teamId = team.id;
      console.log("enforceTeamId - team found skipping", signup.team);
    } else {
      //team not found lets create it!
      console.log("enforceTeamId - cant find signup team", teamAndPlayerId2, 'Team that is empty?', team);
      console.log('enforceTeamId', signup)
      const newTeam = await createTeam(...signup.team);
      await addPlayerToTeam(newTeam, signup.team[0].id, signup.team[1].id);
      signup.teamId = newTeam.id;
    }
  }
  return signups;
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

function trimRight(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }
  if (text[text.length - 1] === " ") {
    return trimLeft(text.slice(0, -1));
  }
  return text;
}

function trim(text) {
  return trimLeft(trimRight(text));
}

main();

