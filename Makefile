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

prep:
	node --max-old-space-size=4096 prepare-osm.js data/ottawa-extracted.osm
	cp data/ottawa-extracted.osm data/lts4/data.osm

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
data:	clean	download prep	osrm


.PHONY: clean data download osrm
