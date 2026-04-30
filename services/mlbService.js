const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

const fetchStandings = async (year) => {
    const cacheKey = `mlb_standings_${year}`;
    let standings = cache.get(cacheKey);

    if (!standings) {
        try {
            const response = await axios.get(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&hydrate=division,league`);

            standings = response.data;
            cache.set(cacheKey, standings);
        } catch (error) {
            console.error("Axios Fetch Error:", error.message);
            throw error;
        }
    }

    return standings;
};

module.exports = {
    fetchStandings
};