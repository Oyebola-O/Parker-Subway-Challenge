"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trip = exports.TrainLine = exports.Station = exports.Card = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
let Card = class Card extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.balance = 0;
    }
};
exports.Card = Card;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Card.prototype, "card_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Card.prototype, "balance", void 0);
exports.Card = Card = __decorate([
    (0, typeorm_1.Entity)()
], Card);
let Station = class Station extends typeorm_1.BaseEntity {
};
exports.Station = Station;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Station.prototype, "name", void 0);
exports.Station = Station = __decorate([
    (0, typeorm_1.Entity)()
], Station);
let TrainLine = class TrainLine extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.fare = 2.75;
    }
};
exports.TrainLine = TrainLine;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], TrainLine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TrainLine.prototype, "fare", void 0);
exports.TrainLine = TrainLine = __decorate([
    (0, typeorm_1.Entity)()
], TrainLine);
let Trip = class Trip extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.final_fare = 0;
    }
};
exports.Trip = Trip;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Trip.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Card, card => card.card_number),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Card)
], Trip.prototype, "card", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station, station => station.name),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Station)
], Trip.prototype, "origin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station, station => station.name),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Station)
], Trip.prototype, "destination", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Trip.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Trip.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Trip.prototype, "final_fare", void 0);
exports.Trip = Trip = __decorate([
    (0, typeorm_1.Entity)()
], Trip);
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "node",
    password: "node",
    database: "subway",
    synchronize: true,
    logging: false,
    entities: [Card, Station, TrainLine, Trip],
    subscribers: [],
    migrations: [],
});
exports.AppDataSource = AppDataSource;
//# sourceMappingURL=postgres.js.map