const express = require('express');
const { routes, init } = require('./src/routes');
// const { HOST, PORT } = require('./src/config/config');
const { config } = require('./src/config');
const cors = require('cors');

const server = express();
// Set EJS as the view engine
server.set('view engine', 'ejs');
server.set('views', __dirname + '/src/views');

// Serve static files (like Vue.js bundle) from the 'public' directory
server.use(express.static('public'));
server.use(cors());

// routes;
server.use('/', routes);

init().then(
  server.listen(config.PORT, () => {
    console.log(`Server running : http://${config.HOST}:${config.PORT}`);
  })
);
