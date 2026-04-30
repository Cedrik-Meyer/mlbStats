const mlbService = require('../services/mlbService');

const getStandings = async (req, res) => {
    try {
        const standings = await mlbService.fetchStandings();
        res.json(standings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch MLB data" });
    }
};

module.exports = {
    getStandings
};