import { DataSource, BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
const POSTGRES_HOST = process.env.POSTGRES_HOST!;
const POSTGRES_PORT = process.env.POSTGRES_PORT!;
const POSTGRES_USER = process.env.POSTGRES_USER!;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD!;
const POSTGRES_DB = process.env.POSTGRES_DB!;

@Entity()
class Card extends BaseEntity {
  @PrimaryColumn() card_number!: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) balance: number = 0;
}

@Entity()
class Station extends BaseEntity {
  @PrimaryColumn() name! : string;
}

@Entity()
class TrainLine extends BaseEntity {
  @PrimaryColumn() name! : string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) fare: number = 2.75;
}

@Entity()
class Trip extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => Card, card => card.card_number)
  @JoinColumn()
  card?: Card;


  @ManyToOne(() => Station, station => station.name)
  @JoinColumn()
  origin! : Station;

  @ManyToOne(() => Station, station => station.name)
  @JoinColumn()
  destination? : Station;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;
  
  @Column({ type: 'decimal', precision: 10, scale: 2 }) final_fare: number = 0;
}


const AppDataSource = new DataSource({
  type: "postgres",
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  synchronize: true,
  logging: false,
  entities: [Card, Station, TrainLine, Trip],
  subscribers: [],
  migrations: [],
});


export { AppDataSource, Card, Station, TrainLine, Trip };