import neo4j, { Driver, Record } from 'neo4j-driver';
const NEO4J_URI = process.env.NEO4J_URI!;
const NEO4J_USER = process.env.NEO4J_USER!;
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD!;

class Neo4jService {
  private driver : Driver;

  constructor(){
    this.driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  }

  async checkConnectivity(): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run('RETURN 1');
      console.log('Connection to Neo4j has been established successfully.');
    } catch (error) {
      console.error('Failed to connect to Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async runQuery(query: string, params: {}): Promise<Record[]> {
    const session = this.driver.session();

    try {
      const result = await session.run(query, params);
      return result.records;
    } catch (error) {
      console.error("Neo4j query failed:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async runTransaction(queries : { query: string, params : {} }[]) : Promise<[boolean, Record[]]> {
    const session = this.driver.session();
    const transaction = session.beginTransaction();
    let results : Record[] = [];
    let passed : boolean = false;

    try {
      for(const { query, params } of queries){
        const result = await transaction.run(query, params);
        results.push(...result.records);
      }
      await transaction.commit();
      passed = true;
    } catch (error) {
      await transaction.rollback();
      console.log("Neo4j Transaction failed", error);
    } finally {
      await session.close();
    }
    
    return [passed, results];
  }
}

export { Neo4jService };