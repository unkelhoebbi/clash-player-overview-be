require('dotenv').config()

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
        let match = await fetch(`${baseUrlEurope}${route}`,{ method: 'GET', headers: headers});
        let match_content = await match.json();
        return match_content;
    }));

    console.log(matches);

    return matches

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