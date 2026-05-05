const mlbService = require('../services/mlbService');

const getSchedule = async (req, res) => {
    try {
        const { teamId, year } = req.query;
        const schedule = await mlbService.fetchTeamSchedule(teamId, year);
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
};

const getStats = async (req, res) => {
    try {
        const { teamId, year } = req.query;
        const stats = await mlbService.fetchTeamStats(teamId, year);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

module.exports = {
    getSchedule,
    getStats
};