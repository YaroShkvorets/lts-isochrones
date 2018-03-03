clean:
	rm -f data/lts1/*
	rm -f data/lts2/*
	rm -f data/lts3/*
	rm -f data/lts4/*
	rm -f data/lts/*

download:
	wget http://mobiletest.beyond2020.com/bikemap/data/level_1.json -O data/lts/level_1.json
	wget http://mobiletest.beyond2020.com/bikemap/data/level_2.json -O data/lts/level_2.json
	wget http://mobiletest.beyond2020.com/bikemap/data/level_3.json -O data/lts/level_3.json
	wget http://mobiletest.beyond2020.com/bikemap/data/level_4.json -O data/lts/level_4.json

tiles:
	export MAPBOX_ACCESS_TOKEN="sk.eyJ1IjoienpwdGljaGthIiwiYSI6ImNqZWFwbXdsMDA4OWkzM2xhdjB0dmZqb2YifQ.sMrDpEWvtIM39hFZqkpLNQ"
	mapbox upload zzptichka.53bf2frg data/lts/level_1.json
	mapbox upload zzptichka.771hbw7i data/lts/level_2.json
	mapbox upload zzptichka.5jgkszgd data/lts/level_3.json
	mapbox upload zzptichka.4ioiilcy data/lts/level_4.json

prep:
	node prepare-osm.js data/ottawa-extracted.osm 1 > data/lts1/data.osm
	node prepare-osm.js data/ottawa-extracted.osm 2 > data/lts2/data.osm
	node prepare-osm.js data/ottawa-extracted.osm 3 > data/lts3/data.osm
	node prepare-osm.js data/ottawa-extracted.osm 4 > data/lts4/data.osm

osrm:
	./node_modules/osrm/lib/binding/osrm-extract data/lts1/data.osm -p ./node_modules/osrm/profiles/bicycle.lua
	./node_modules/osrm/lib/binding/osrm-extract data/lts2/data.osm -p ./node_modules/osrm/profiles/bicycle.lua
	./node_modules/osrm/lib/binding/osrm-extract data/lts3/data.osm -p ./node_modules/osrm/profiles/bicycle.lua
	./node_modules/osrm/lib/binding/osrm-extract data/lts4/data.osm -p ./node_modules/osrm/profiles/bicycle.lua
	./node_modules/osrm/lib/binding/osrm-contract data/lts1/data.osrm
	./node_modules/osrm/lib/binding/osrm-contract data/lts2/data.osrm
	./node_modules/osrm/lib/binding/osrm-contract data/lts3/data.osrm
	./node_modules/osrm/lib/binding/osrm-contract data/lts4/data.osrm


# cleans old data
data:	clean	download tiles prep	osrm


.PHONY: clean data download tiles osrm
