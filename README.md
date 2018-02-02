# lts-isochrones
draw isochrones based on level of traffic stress 

1. Get OSM extract. Ottawa.osm provided

2. Filter out useless objects with osmfilter:

    `osmfilter ottawa.osm --keep="highway railway amenity=parking barrier" > streets.osm`
    
3. Prepare LTS OSM data for each LTS level. 4 files in total (paths hardcoded for now):

    `node prepare-osm.js`

4. Prepare osrm data:

    `../../node_modules/osrm/lib/binding/osrm-extract -p ../../node_modules/osrm/profiles/bicycle.lua ./lts1/data.osm`
    `../../../node_modules/osrm/lib/binding/osrm-contract ./lts1/data.osrm`
    
5. Run isochrone server:

    `node server.js data/lts4/data.osrm`
    
6. Open `html/index.html` in browser
