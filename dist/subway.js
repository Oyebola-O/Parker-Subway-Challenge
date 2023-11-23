"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subway = void 0;
const neo4j_1 = require("./neo4j");
const postgres_1 = require("./postgres");
class Subway {
    constructor() {
        this.neo4j = new neo4j_1.Neo4jService();
        this.trainCache = new Set();
        this.stationCache = new Set();
        this.routeCache = new Map();
        this.initializeCaches();
    }
    initializeCaches() {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `
    MATCH ()-[line:Line]-()
    WITH COLLECT(DISTINCT line.name) AS lineNames
    MATCH (station:Station)
    RETURN lineNames, COLLECT(station.name) AS stationNames
    `;
            try {
                const result = yield this.neo4j.runQuery(query, {});
                const record = result[0];
                const lineNames = record.get('lineNames');
                const stationNames = record.get('stationNames');
                lineNames.forEach((name) => this.trainCache.add(name));
                stationNames.forEach((name) => this.stationCache.add(name));
            }
            catch (error) {
                console.log("Could not initialize tain cache");
            }
        });
    }
    addLine(train, stations, fare = 2.75) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.trainCache.has(train)) {
                return [false, { message: "This train line is already in the database" }];
            }
            let queries = [];
            for (let i = 0; i < stations.length - 1; i++) {
                const query = `
        MERGE (a:Station {name: $currStation})
        MERGE (b:Station {name: $nextStation})
        MERGE (a)-[:Line {name: $train, fare: $fare}]->(b)
        MERGE (b)-[:Line {name: $train, fare: $fare}]->(a)
      `;
                const params = { currStation: stations[i], nextStation: stations[i + 1], train, fare };
                queries.push({ query, params });
            }
            try {
                yield this.neo4j.runTransaction(queries);
                yield postgres_1.TrainLine.save(postgres_1.TrainLine.create({ name: train, fare: fare }));
                for (let station of stations) {
                    yield postgres_1.Station.save(postgres_1.Station.create({ name: station }));
                    this.stationCache.add;
                }
                this.trainCache.add(train);
                this.routeCache.clear();
                return [true, { message: `Successfully added the new ${train} line` }];
            }
            catch (error) {
                console.log(error);
                return [false, { message: "We weren't able to add this new train line" }];
            }
        });
    }
    getPath(origin, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.stationCache.has(origin))
                return [false, { message: `${origin} is not a valid station` }];
            if (!this.stationCache.has(destination))
                return [false, { message: `${destination} is not a valid station` }];
            if (origin == destination)
                return [false, { message: `Origin and Destination cannot be the same` }];
            const key = `${origin}-${destination}`;
            if (this.routeCache.has(key)) {
                return [true, this.routeCache.get(key)];
            }
            let query = `
    MATCH (start:Station {name: $origin}), (end:Station {name: $destination})
      CALL {
        WITH start, end
        MATCH path = SHORTESTPATH((start)-[trainlines:Line*]-(end))
        RETURN path
    }
    UNWIND relationships(path) AS trainline
    WITH DISTINCT trainline.name AS lineName, trainline.fare AS fare, path
    WITH sum(fare) AS totalFare, nodes(path) AS stations, relationships(path) AS trainlines
    RETURN totalFare, [station IN stations | station.name] AS stations, [train in trainlines | train.name] AS trains
    `;
            let params = { origin, destination };
            try {
                const result = yield this.neo4j.runQuery(query, params);
                const record = result.map(record => {
                    return {
                        stations: record.get('stations'),
                        trains: record.get('trains'),
                        totalFare: record.get('totalFare')
                    };
                })[0];
                this.routeCache.set(key, record);
                return [true, record];
            }
            catch (error) {
                console.error(error);
                return [false, { message: "Could not get shortest path" }];
            }
        });
    }
    getFare(origin, destination) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let [success,] = yield this.getPath(origin, destination);
            let price = (_a = this.routeCache.get(`${origin}-${destination}`)) === null || _a === void 0 ? void 0 : _a.totalFare;
            if (success && price) {
                return [true, price];
            }
            return [false, -1];
        });
    }
}
exports.Subway = Subway;
//# sourceMappingURL=subway.js.map