const reader = require('geojson-writer').reader
const bigXml = require('big-xml');
const XMLSerializer = require('xmldom').XMLSerializer;
const serializer = new XMLSerializer();

const fs = require('fs');
const progressBar = require('progress');

const args = require('minimist')(process.argv.slice(2));
let inOsmPath = "data/ottawa-extracted.osm";

if (args.help) {
  const usage = `
  Usage: node prepare-osm.js [osm_file]

  where [osm_file] is path to osm extract
  `;
  process.stdout.write(`${usage}\n`);
  process.exit(0);
}


try {
  inOsmPath = args._[0];
  fs.accessSync(inOsmPath, fs.F_OK);
} catch (error) {
  process.stderr.write("Specify valid path to osm file. See --help for details\n"/*,`${error}\n`*/);
  process.exit(-1);
}



const levels = [{name: "LTS-1", inLtsJsonFile: "data/lts/level_1.json", outLtsOsmile: "data/lts1/data.osm", ways: []},
                {name: "LTS-2", inLtsJsonFile: "data/lts/level_2.json", outLtsOsmile: "data/lts2/data.osm", ways: []},
                {name: "LTS-3", inLtsJsonFile: "data/lts/level_3.json", outLtsOsmile: "data/lts3/data.osm", ways: []}/*,
                {name: "LTS-4", inLtsJsonFile: "data/lts/level_4.json", outLtsOsmile: "data/lts4/data.osm", ways: []}*/]

let totalTagged = 0


var bar = new progressBar('  :title [:bar] :percent', {
    complete: '='
  , incomplete: ' '
  , width: 30
  , total: 12805
});

console.time('Time')
for (let i=0; i<levels.length; i++) {
  let level = levels[i]
  let way_ids = []
  //console.log("Loading data from", level.inLtsJsonFile)
  for(let j=0; j<=i; j++){

    let ltsFile = reader(levels[j].inLtsJsonFile)
    for(let feature of ltsFile.features) {
      if(feature.properties.id){
        level.ways.push(feature.properties.id.split('/')[1])
      }
    }
  }
//  console.log(level.name, "contains", level.ways.length,"ways");
}


console.log("<?xml version='1.0' encoding='UTF-8'?>")
console.log('<osm version="0.6" generator="osmfilter 1.4.3">')

var xml = bigXml.createReader(inOsmPath, /^(node|way|bounds|relation)$/, { gzip: false });

xml.on('record', function(record) {
  var node = '<'+record.tag
  for (var prop in record.attrs) {
      node += ' '+prop + '="'+record.attrs[prop].replace('<','&#60;').replace('>','&#62;').replace("'",'&#39;')+'"'
  }
  if(record.children && record.children.length){

    node+='>\n'
    for (var child of record.children) {
        node += '\t<'+child.tag
        for (var prop in child.attrs) {
            node += ' '+prop + '="'+child.attrs[prop].replace('<','&#60;').replace('>','&#62;').replace("'",'&#39;')+'"'
        }
        node+='/>\n'
    }
    node+='</'+record.tag+'>'
  }
  else{
    node+='/>'

  }
  console.log(node);

});

xml.on('end', function() {
  console.log('</osm>')
});
