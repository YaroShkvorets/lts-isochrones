const reader = require('geojson-writer').reader
const xmldom = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer;
const fs = require('fs');
var progressBar = require('progress');

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



const serializer = new XMLSerializer();
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
  console.log(level.name, "contains", level.ways.length,"ways");
}

for (let i in levels) {

  let level = levels[i]
  fs.readFile(inOsmPath, 'utf-8', function (err, data) {
    if (err) {
      throw err;
    }
    console.log("Loading "+inOsmPath+" ...");
    const doc = new xmldom().parseFromString(data, 'application/xml');
    console.log("Filtering out", level.ways.length, level.name, "ways");

/*
    const nodes = doc.getElementsByTagName('node');
    let nodesDeleted = 0;
    let nodesPreserved = 0;
    for (let i in nodes) {
      let node = nodes[i]
      let preserve = false
      for(let k in node.childNodes){
        let tag = node.childNodes[k]
        if(!tag.attributes){continue}
        let attr = tag.attributes[0]
        if (tag.attributes[0].name=='k' && tag.attributes[0].value=='barrier' ||
            tag.attributes[0].name=='k' && tag.attributes[0].value=='highway') {
              preserve = true;
              break;
        }
      }
      if(preserve || node.parentNode==null){
        nodesPreserved++;
      }
      else{
        node.parentNode.removeChild(node)
        nodesDeleted++
      }

    }
    console.log(level.name, "Nodes preserved:", nodesPreserved, "Nodes deleted:", nodesDeleted);
*/
    const ways = doc.getElementsByTagName('way');
    bar.total = ways.length+10   //+10 to account for some garbage at the end
    bar.curr = 0
    let waysDeleted = waysPreserved = waysService = 0;
    for (let i in ways) {
      bar.tick(1, { title: i+' of ' +bar.total });
      let way = ways[i]
      for(let j in way.attributes){
        let attr = way.attributes[j]
        if (attr.name=='id') {
          const id = attr.value;
          if(level.ways.includes(id)){
            waysPreserved++
          }
          else {
            let service = false;
            for(let k in way.childNodes){
              let node = way.childNodes[k]
              if(!node.attributes){continue}
              let attr = node.attributes[0]
              if (node.attributes[0].value=='service' && node.attributes[1].value=='parking_aisle'
                  || node.attributes[0].value=='service' && node.attributes[1].value=='driveway'
                  || node.attributes[0].value=='footway' && node.attributes[1].value!='sidewalk') {
                    service = true;
                    break;
                  }
            }
            if(service){
              waysService++;
            }
            else{
              way.parentNode.removeChild(way)
              waysDeleted++
            }
          }

        }
      }
    }

    console.log("\n",level.name, "Ways preserved:", waysPreserved, "Ways service:", waysService, "Ways deleted:", waysDeleted);

    fs.writeFile(level.outLtsOsmile, serializer.serializeToString(doc), function(err) {
      if(err) {
          return console.log(err);
      }

    });

  });
}




console.timeEnd('Time')
