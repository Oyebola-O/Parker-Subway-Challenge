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
exports.Neo4jService = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
class Neo4jService {
    constructor() {
        this.driver = neo4j_driver_1.default.driver('neo4j://localhost:7687', neo4j_driver_1.default.auth.basic('neo4j', 'password'));
    }
    runQuery(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.driver.session();
            try {
                const result = yield session.run(query, params);
                return result.records;
            }
            catch (error) {
                console.error("Neo4j query failed:", error);
                throw error;
            }
            finally {
                yield session.close();
            }
        });
    }
    runTransaction(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.driver.session();
            const transaction = session.beginTransaction();
            let results = [];
            let passed = false;
            try {
                for (const { query, params } of queries) {
                    const result = yield transaction.run(query, params);
                    results.push(...result.records);
                }
                yield transaction.commit();
                passed = true;
            }
            catch (error) {
                yield transaction.rollback();
                console.log("Neo4j Transaction failed", error);
            }
            finally {
                yield session.close();
            }
            return [passed, results];
        });
    }
}
exports.Neo4jService = Neo4jService;
//# sourceMappingURL=neo4j.js.map