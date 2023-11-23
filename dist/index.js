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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.subway = void 0;
const fastify_1 = __importDefault(require("fastify"));
const schemas_1 = require("./schemas");
const subway_1 = require("./subway");
const admin_1 = require("./admin");
const postgres_1 = require("./postgres");
const fastify = (0, fastify_1.default)({ logger: false });
const subway = new subway_1.Subway();
exports.subway = subway;
const admin = new admin_1.Admin();
exports.admin = admin;
const port = 3000;
fastify.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send({ message: 'Hello World, Server Works!' });
}));
fastify.get('/route', schemas_1.routeSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { origin, destination } = req.query;
    const [success, message] = yield subway.getPath(origin, destination);
    res.status(success ? 200 : 400).send({ message });
}));
fastify.post('/train-line', schemas_1.trainLineSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stations, name, fare } = req.body;
    const [success, message] = yield subway.addLine(name, stations, fare);
    res.status(success ? 200 : 400).send({ message });
}));
fastify.post('/card', schemas_1.cardSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { card_number, amount } = req.body;
    const [success, message] = yield admin.createOrUpdateCard(card_number, amount);
    res.status(success ? 200 : 400).send({ message });
}));
fastify.post('/station/:station/enter', schemas_1.tripSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { station } = req.params;
    const { card_number } = req.body;
    const [success, message] = yield admin.beginTrip(card_number, station);
    res.status(success ? 200 : 400).send({ message });
}));
fastify.post('/station/:station/exit', schemas_1.tripSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { station } = req.params;
    const { card_number } = req.body;
    const [success, message] = yield admin.endTrip(card_number, station);
    res.status(success ? 200 : 400).send({ message });
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield postgres_1.AppDataSource.initialize();
        yield fastify.listen({ port: port, host: "0.0.0.0" });
    }
    catch (err) {
        console.log(err);
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
//# sourceMappingURL=index.js.map