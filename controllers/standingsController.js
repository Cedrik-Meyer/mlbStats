const mlbService = require('../services/mlbService');

const getStandings = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const year = req.query.year || currentYear;

        const standings = await mlbService.fetchStandings(year);
        res.json(standings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch MLB data" });
    }
};

module.exports = {
    getStandings
};