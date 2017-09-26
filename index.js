/* @flow */

import Rx from "rxjs/Rx";
import { map, mergeAll, flatMap } from "rxjs";
import { mapTo } from "rxjs/operator/mapTo";
import { concatMap } from "rxjs/operator/concatMap";

import lodash from "lodash";
import sendToApi from "./player-api";
import getCupassistData from "./cupassist";
import { debugOk, debugError, debugComplete, log } from "./helpers";

const players = [];

const delayWithSelector = Rx.Observable.prototype.delayWithSelector;

const Promise = require("bluebird");

if (
  typeof process.env.CUPASSIST_API === "undefined" ||
  process.env.CUPASSIST_API === null
) {
  throw new Error("Please set CUPASSIST_API as a env.var");
}

const CUPASSIST_API = `${process.env.CUPASSIST_API}/ranking`;

const YEARS = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];

const requestData$ = Rx.Observable
  .interval(200)
  .take(YEARS.length)
  .map(i => YEARS[i])
  .map(populateYearsUrls)
  .concatMap(populateGenderUrls);

const players$ = requestData$
  .concatMap(getCupassistData)
  .filter(object => object !== null)
  .concatMap(extractPlayers)
  .filter(object => object.name !== undefined)
  .groupBy(getPlayerId)
  .flatMap(createDBFormat);

players$.subscribe(savePlayers, debugError, startProcessing);
// .subscribe(handlePlayers, debugError, debugComplete);

function savePlayers(player) {
  players.push(player);
}

function startProcessing() {
  log("startProcessing");
  Rx.Observable
    .interval(200)
    .take(players.length)
    .map(i => players[i])
    .subscribe(sendToApi, debugError, debugComplete);
}

function createDBFormat(groupedObservable) {
  return groupedObservable
    .reduce((aggObject, playerYear) => {
      const playerRankingYear = {
        [`rankingPoints_${playerYear.year}`]: playerYear.points
      };
      return Object.assign({}, aggObject, playerYear, playerRankingYear);
    }, {})
    .map(player => {
      return Object.assign(
        {
          firstName: player.name.split(" ").slice(0, -1).join(" ").trim(),
          lastName: player.name.split(" ").slice(-1).join(" ").trim(),
          name: player.name,
          externalId: player.cupassistId
        },
        lodash.omit(player, ["year", "points", "name", "cupassistId", "url"])
      );
    });
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
