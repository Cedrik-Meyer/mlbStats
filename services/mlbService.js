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

const fetchTeamSchedule = async (teamId, year) => {
    const cacheKey = `mlb_schedule_${teamId}_${year}`;
    let schedule = cache.get(cacheKey);

    if (!schedule) {
        try {
            const response = await axios.get(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${teamId}&season=${year}&gameType=R,F,D,L,W&hydrate=team,linescore`);
            schedule = response.data.dates || [];
            cache.set(cacheKey, schedule);
        } catch (error) {
            throw error;
        }
    }
    return schedule;
};

const fetchTeamStats = async (teamId, year) => {
    const cacheKey = `mlb_stats_${teamId}_${year}`;
    let stats = cache.get(cacheKey);

    if (!stats) {
        try {
            const response = await axios.get(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?season=${year}&hydrate=person(stats(type=season,season=${year},statGroup=[hitting,pitching]))`);
            stats = response.data.roster || [];
            cache.set(cacheKey, stats);
        } catch (error) {
            throw error;
        }
    }
    return stats;
};

module.exports = {
    fetchStandings,
    fetchTeamSchedule,
    fetchTeamStats
};