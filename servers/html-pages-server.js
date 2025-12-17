const express = require('express');
const path = require('path');
const app = express();
const PORT = UI_CONSTANTS.DEFAULT_PORT;

app.use(express.static(__dirname));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'feed.html')));

app.listen(PORT, () => );
`