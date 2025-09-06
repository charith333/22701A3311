const express = require('express');
const logger = require('./middleware/logger');
const shortenerRoutes = require('./routes/shortener');

const app = express();
app.use(express.json());
app.use(logger);

app.use('/', shortenerRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
