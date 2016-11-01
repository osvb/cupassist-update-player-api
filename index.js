/* @flow */

import Rx from 'rxjs/Rx';
import { map, mergeAll, flatMap } from 'rxjs';
import { mapTo } from 'rxjs/operator/mapTo';
import { do } from 'rxjs/operator/do';
import { concatMap } from 'rxjs/operator/concatMap';

import lodash from 'lodash'
import isPlayerInPlayerAPI from './api'
import insertIntoDB from './db'
import getCupassistData from './cupassist'
import { debugOk, debugError, debugComplete, log } from './helpers'

const players = []

const delayWithSelector = Rx.Observable.prototype.delayWithSelector;

const Promise = require("bluebird");

const API_URL = "https://api.osvb.no/ranking";

const YEARS= [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];

const requestData$ = Rx.Observable.interval(200)
      .take(YEARS.length)
      .map((i) => YEARS[i])
      .map(populateYearsUrls)
      .concatMap(populateGenderUrls)

const players$ = requestData$
  .concatMap(getCupassistData)
  .filter(object => object !== null)
  .concatMap(extractPlayers)
  .filter(object => object.name !== undefined)
  .groupBy(getPlayerId)
  .flatMap(createDBFormat)

players$
  .subscribe(savePlayers, debugError, startProcessing);
      // .subscribe(handlePlayers, debugError, debugComplete);


function savePlayers(player) {
  players.push(player);
}

function startProcessing() {
  log('startProcessing')
  Rx.Observable
    .interval(50)
    .take(players.length)
    .map(i => players[i])
    .do(insertIntoDB)
    .subscribe(debugOk, debugError, debugComplete)
}

function createDBFormat(groupedObservable) {
  return groupedObservable.reduce((aggObject, playerYear) => {
      const playerRankingYear = { [`rankingPoints_${playerYear.year}`]: playerYear.points}
      return Object.assign({}, aggObject, playerYear, playerRankingYear);
    }, {})
    .map(player => {
      return Object.assign({
        firstName: player.name.split(' ').slice(0, -1).join(" ").trim(),
        lastName: player.name.split(' ').slice(-1).join(" ").trim(),
        externalId: player.cupassistId,
      },lodash.omit(player, ['year', 'points', 'name', 'cupassistId']))
    })
}

function getPlayerId(object) {
  return object.cupassistId;
}

function extractPlayers(response) {
  return response.data.map(player => {
    return Object.assign({}, lodash.omit(response, 'data'), player);
  })
}

function populateYearsUrls(year) {
  return {
    year: year,
    url: `${API_URL}/${year}`
  }
}

function populateGenderUrls(object) {
  return [
    Object.assign({}, object, { url:`${object.url}/K`, gender: 'K' }),
    Object.assign({}, object, { url:`${object.url}/M`, gender: 'M' }),
  ];
}
