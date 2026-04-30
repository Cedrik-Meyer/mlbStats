const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

const fetchStandings = async () => {
    let standings = cache.get('mlb_standings');

    if (!standings) {
        try {
            const response = await fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2024&standingsTypes=regularSeason&hydrate=division,league');
            const data = await response.json();

            standings = data;
            cache.set('mlb_standings', standings);
        } catch (error) {
            console.error("Backend Fetch Error:", error);
            throw error;
        }
    }

    return standings;
};

module.exports = {
    fetchStandings
};