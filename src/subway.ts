import { Neo4jService } from "./neo4j";
import { Station, TrainLine } from "./postgres";

class Subway {
  private neo4j: Neo4jService;
  private trainCache: Set<string>;
  private stationCache: Set<string>;
  private routeCache: Map<string, { stations: string[], trains: string[], totalFare: number }>;

  constructor(neo4jService : Neo4jService) {
    this.neo4j = neo4jService;
    this.trainCache = new Set();
    this.stationCache = new Set();
    this.routeCache = new Map();
    this.initializeCaches();
  }

  private async initializeCaches(): Promise<void> {
    let query = `
    MATCH ()-[line:Line]-()
    WITH COLLECT(DISTINCT line.name) AS lineNames
    MATCH (station:Station)
    RETURN lineNames, COLLECT(station.name) AS stationNames
    `;

    try {
      const result = await this.neo4j.runQuery(query, {});
      const record = result[0];

      if(!record) {
        console.log("Neo4j database is empty");
        return;
      }
      const lineNames = record.get('lineNames');
      const stationNames = record.get('stationNames');
      
      lineNames.forEach((name : string) => this.trainCache.add(name));
      stationNames.forEach((name : string) => this.stationCache.add(name));
    } catch (error) {
      console.log(error);
      console.log("Could not initialize subway caches");
    }
  }

  /* Public */
  async addLine(train: string, stations: string[], fare: number = 2.75): Promise<[boolean, { message : string }]> {
    if (this.trainCache.has(train)) {
      return [false, { message : "This train line is already in the database" }];
    }

    let queries: { query: string, params: {} }[] = [];

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
      /* There's an issue with this part, if execution fails for some reason,
      I don't rollback. I'd have to rewrite my neo4j.ts or move the transaction here to fix that*/
      await this.neo4j.runTransaction(queries);
      await TrainLine.save(TrainLine.create({ name: train, fare: fare }));
      for(let station of stations){
        await Station.save(Station.create({ name: station }));
        this.stationCache.add(station);
      }

      this.trainCache.add(train);
      this.routeCache.clear();
      return [true, { message: `Successfully added the new ${train} line` }];
    } catch (error) {
      console.log(error);
      return [false, { message: "We weren't able to add this new train line" }];
    }
  }

  async getPath(origin: string, destination: string): Promise<[boolean, { stations: string[], trains: string[], totalFare: number } | { message : string }]> {
    if(!this.stationCache.has(origin)) return [false, { message : `${origin} is not a valid station` }];
    if(!this.stationCache.has(destination)) return [false, { message : `${destination} is not a valid station` }];
    if(origin == destination) return [false, { message : `Origin and Destination cannot be the same` }];

    const key = `${origin}-${destination}`;
    if (this.routeCache.has(key)) {
      return [true, this.routeCache.get(key)!];
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
    `
    let params = { origin, destination };

    try {
      const result = await this.neo4j.runQuery(query, params);
      const record = result.map(record => {
        return {
          stations: record.get('stations'),
          trains: record.get('trains'),
          totalFare: record.get('totalFare')
        };
      })[0];

      this.routeCache.set(key, record);
      return [true, record];
    } catch (error) {
      console.error(error);
      return [false, { message : "Could not get shortest path"}];
    }
  }

  async getFare(origin: string, destination: string) : Promise<[boolean, number]> {
    let [success, ] = await this.getPath(origin, destination);
    let price = this.routeCache.get(`${origin}-${destination}`)?.totalFare;

    if(success && price){
      return [true, price];
    }
    return [false, -1];
  }
}


export { Subway };