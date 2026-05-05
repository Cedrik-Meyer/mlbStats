const express = require('express');
const path = require('path');
const standingsRoutes = require('./routes/standingsRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/standings', standingsRoutes);
app.use('/api/team', teamRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});