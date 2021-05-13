require('dotenv').config()
let _ = require('lodash');
let fetch = require('node-fetch');
const headers = {
    'X-Riot-Token': process.env.API_KEY
};

const baseUrlEurope = 'https://europe.api.riotgames.com/lol'
const baseUrlEuw1 = 'https://euw1.api.riotgames.com/lol'


async function getMatchHistory(name) {
    let puuid = await getPlayerPuuid(name);
    console.log(puuid);

    let route = `/match/v5/matches/by-puuid/${puuid}/ids`;

    let response = await fetch(`${baseUrlEurope}${route}`,{ method: 'GET', headers: headers});
    let content = await response.json();

    let matches = await Promise.all(content.map( async function (matchId) {
        let route = `/match/v5/matches/${matchId}`;
        let response = await fetch(`${baseUrlEurope}${route}`,{ method: 'GET', headers: headers});
        let match = await response.json();
        return match.info.participants.filter(participant => participant.puuid === puuid)[0];
    }));

    let champions =  _.chain(matches)
        .groupBy("championName")
        .value();

    return Object.keys(champions).map(championName => {
        let championMatches = champions[championName];
        let returnObject = {};

        returnObject.name = championName;
        returnObject.championAvatar = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;

        returnObject.assists = championMatches.reduce(function(prev, cur) {
            return prev + cur.assists;
        }, 0);

        returnObject.deaths = championMatches.reduce(function(prev, cur) {
            return prev + cur.deaths;
        }, 0);

        returnObject.kills = championMatches.reduce(function(prev, cur) {
            return prev + cur.kills;
        }, 0);

        returnObject.winRate = championMatches.reduce(function(prev, cur) {
            if (cur.win) {
                return ++prev;
            }
            return prev;
        }, 0);

        returnObject.assists = Math.round(returnObject.assists / championMatches.length);
        returnObject.deaths = Math.round(returnObject.deaths / championMatches.length);
        returnObject.kills = Math.round(returnObject.kills / championMatches.length);
        returnObject.winRate = Math.round(returnObject.winRate / championMatches.length * 100);
        returnObject.games = championMatches.length;
        return returnObject;
    });
}

async function getPlayerPuuid(name) {
    let route = '/summoner/v4/summoners/by-name/'

    let response = await fetch(`${baseUrlEuw1}${route}${name}`,{ method: 'GET', headers: headers});
    let content = await response.json();
    console.log(content);
    console.log(content.puuid);
    return content.puuid;
}

module.exports.getMatchHistory = getMatchHistory;
module.exports.getPlayerPuuid = getPlayerPuuid;