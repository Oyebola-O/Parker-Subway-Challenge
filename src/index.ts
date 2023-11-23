import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import 'dotenv/config';
import { AppDataSource } from "./postgres";
import { Neo4jService } from './neo4j';
import { RouteQuery, TrainLineBody, CardBody, TripParams, TripBody } from "./schemas";
import { routeSchema, trainLineSchema, cardSchema, tripSchema } from "./schemas";
import { Subway } from "./subway";
import { Admin } from "./admin";


const fastify = Fastify({ logger: false });
const port = 3000;
declare module 'fastify' {
  export interface FastifyInstance {
    subway: Subway;
    admin: Admin;
  }
}

fastify.get('/', async(_req, res: any) => {
  res.status(200).send({ message : 'Hello World, Server Works!' });
});

fastify.get('/route', routeSchema, async(req : FastifyRequest<{ Querystring: RouteQuery }>, res : FastifyReply) => {
  const { origin, destination } = req.query;

  const [success, message] = await fastify.subway.getPath(origin, destination);
  res.status(success ? 200 : 400).send({ message });
});

fastify.post('/train-line', trainLineSchema, async(req : FastifyRequest<{ Body: TrainLineBody }>, res : FastifyReply) => {
  const { stations, name, fare } = req.body;

  const [success, message] = await fastify.subway.addLine(name, stations, fare);
  res.status(success ? 200 : 400).send({ message });
});

fastify.post('/card', cardSchema, async(req : FastifyRequest<{ Body: CardBody }>, res : FastifyReply) => {
  const { card_number, amount } = req.body;

  const [success, message] = await fastify.admin.createOrUpdateCard(card_number, amount);
  res.status(success ? 200 : 400).send({ message });
});

fastify.post('/station/:station/enter', tripSchema, async(req : FastifyRequest<{ Params: TripParams, Body: TripBody }>, res : FastifyReply) => {
  const { station } = req.params; const { card_number } = req.body;

  const [success, message] = await fastify.admin.beginTrip(card_number, station);
  res.status(success ? 200 : 400).send({ message });
});

fastify.post('/station/:station/exit', tripSchema, async(req : FastifyRequest<{ Params: TripParams, Body: TripBody }>, res : FastifyReply) => {
  const { station } = req.params; const { card_number } = req.body;

  const [success, message] = await fastify.admin.endTrip(card_number, station);
  res.status(success ? 200 : 400).send({ message });
});

const start = async () => {
  let attempts = 0;

  const tryConnect = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      if(!AppDataSource.isInitialized) await AppDataSource.initialize();
      const neo4j = new Neo4jService();
      await neo4j.checkConnectivity();

      const subway = new Subway(neo4j);
      const admin = new Admin(subway);

      fastify.decorate('subway', subway);
      fastify.decorate('admin', admin);

      await fastify.listen({ port: port, host: "0.0.0.0" });
      console.log(`Server successfully running on port ${port}`);
    } catch (err) {
      console.log(err);
      fastify.log.error(err);

      attempts++;
      const delay = 3000 * attempts;
      console.log(`Waiting ${delay}ms befor trying again`);

      if(attempts == 5) {
        console.log(`Could not connect to server in reasonable time after ${attempts} attempts`);
        process.exit(1);
      }

      setTimeout(tryConnect, delay);
    } 
  }

  tryConnect();
};

start();