const reader = require('geojson-writer').reader
const xmldom = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer;
const fs = require('fs');


const inOsmCity = "data/ottawa-extracted.osm"

const levels = [{name: "LTS-1", inLtsJsonFile: "data/lts/level_1.json", outLtsOsmile: "data/lts1/data.osm", ways: []},
                {name: "LTS-2", inLtsJsonFile: "data/lts/level_2.json", outLtsOsmile: "data/lts2/data.osm", ways: []},
                {name: "LTS-3", inLtsJsonFile: "data/lts/level_3.json", outLtsOsmile: "data/lts3/data.osm", ways: []}/*,
                {name: "LTS-4", inLtsJsonFile: "data/lts/level_4.json", outLtsOsmile: "data/lts4/data.osm", ways: []}*/]



const serializer = new XMLSerializer();
let totalTagged = 0


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
  fs.readFile(inOsmCity, 'utf-8', function (err, data) {
    if (err) {
      throw err;
    }
    console.log("Filtering out", level.ways.length, level.name, "ways");
    const doc = new xmldom().parseFromString(data, 'application/xml');
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
    let waysDeleted = 0;
    let waysPreserved = 0;
    for (let i in ways) {
      let way = ways[i]
      for(let j in way.attributes){
        let attr = way.attributes[j]
        if (attr.name=='id') {
          const id = attr.value;
          if(level.ways.includes(id)){
            waysPreserved++
          }
          else {
            way.parentNode.removeChild(way)
            waysDeleted++
          }

        }
      }
    }

    console.log(level.name, "Ways preserved:", waysPreserved, "Ways deleted:", waysDeleted);

    fs.writeFile(level.outLtsOsmile, serializer.serializeToString(doc), function(err) {
      if(err) {
          return console.log(err);
      }

    });

  });
  console.log("Done");
}




console.timeEnd('Time')
