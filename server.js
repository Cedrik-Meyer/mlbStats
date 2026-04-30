const express = require('express');
const path = require('path');
const standingsRoutes = require('./routes/standingsRoutes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/standings', standingsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});