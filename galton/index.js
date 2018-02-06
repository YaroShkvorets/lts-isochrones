const url = require('url');
const OSRM = require('osrm');
const isochrone = require('./isochrone');
const parseQuery = require('./utils');

/**
 * Isochrone server
 *
 * @name galton (slightly modified)
 * @param {serverConfig} config default isochrone options
 */
const galton = (config) => {
  let osrmServers = {}
  for(let path of config.osrmPaths){
    const dir = path.split('/')[1]
      osrmServers[dir] = new OSRM({
      path: path,
      shared_memory: config.sharedMemory
    })
  }

  return (req, res) => {
    const { query } = url.parse(req.url, true);
    const osrm = osrmServers[query.dir]
    const options = Object.assign({}, parseQuery(query),{osrm});

    if (config.cors) {
     res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (typeof options.lng != 'undefined')
    {
      isochrone([options.lng, options.lat], options)
        .then(geojson => res.end(JSON.stringify(geojson)))
        .catch((error) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error }));
        });
    }
  };
};

module.exports = galton;
