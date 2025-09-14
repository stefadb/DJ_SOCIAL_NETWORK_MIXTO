"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonDeezerGetTestSuite = commonDeezerGetTestSuite;
exports.commonGetApiTestSuite = commonGetApiTestSuite;
const server_1 = __importDefault(require("../src/server"));
const db_init_insert_queries_json_1 = __importDefault(require("./entities_crud_tests/db_init_insert_queries.json"));
const common_functions_1 = require("./common_functions");
const get_db_tables_and_columns_1 = require("../src/get_db_tables_and_columns");
function commonDeezerGetTestSuite(testConfig, mockDeezerResponseRaw, expectedApiSuccessResponse, mockedAxios) {
    const deezerApiCallUrl = testConfig.deezerApiCallUrl;
    const apiName = testConfig.apiName;
    const testApiCallUrl = testConfig.testApiCallUrl;
    const entityName = testConfig.entityName;
    describe(`GET ${apiName}`, () => {
        //Configurazione dei mock delle API
        beforeEach(async () => {
            await (0, get_db_tables_and_columns_1.getDbTablesAndColumns)();
            await (0, common_functions_1.createOrDeleteTablesOnTestDb)(undefined, false);
            await (0, common_functions_1.createOrDeleteTablesOnTestDb)(testConfig.queriesAfterDbInit, true);
            await (0, common_functions_1.prepareMocksForDeezerResponseAndImages)(mockDeezerResponseRaw, deezerApiCallUrl, mockedAxios);
        });
        afterEach(async () => {
            await (0, common_functions_1.createOrDeleteTablesOnTestDb)(undefined, false);
            await jest.clearAllMocks();
        });
        //Descrizioni dei test
        it(`should return the same ${entityName} that Deezer returns`, async () => {
            await (0, common_functions_1.checkApiSuccessResponse)(testApiCallUrl, server_1.default, expectedApiSuccessResponse);
        });
        for (const dbUpsertTest of testConfig.dbUpsertTests) {
            it(`should upsert to the db the same ${dbUpsertTest.entityName} that Deezer returns`, async () => {
                await (0, common_functions_1.checkDbUpsert)(dbUpsertTest.sqlQuery, testApiCallUrl, server_1.default, dbUpsertTest.expectedResult);
            });
        }
        if (testConfig.photosIdToDownload !== undefined) {
            it(`should upload the photo/photos that Deezer returns`, async () => { await (0, common_functions_1.testPicturesDownload)(testConfig.photosIdToDownload, testApiCallUrl, server_1.default); });
        }
    });
}
function commonGetApiTestSuite(testConfig, expectedApiSuccessResponse) {
    for (const [i, config] of testConfig.entries()) {
        if (expectedApiSuccessResponse[i] === undefined) {
            throw new Error(`Expected API success response at index ${i} is undefined. Please check the expectedApiSuccessResponse array.`);
        }
        //PROBLEMA: Qui expectedApiSuccessResponse[index] as Object è definito, mentre dentro il test it() è undefined
        describe(`GET ${config.testApiCallUrl}`, () => {
            //Configurazione dei mock delle API
            beforeEach(async () => {
                await (0, get_db_tables_and_columns_1.getDbTablesAndColumns)();
                await (0, common_functions_1.createOrDeleteTablesOnTestDb)(undefined, false);
                await (0, common_functions_1.createOrDeleteTablesOnTestDb)(db_init_insert_queries_json_1.default, true);
            });
            afterEach(async () => {
                await (0, common_functions_1.createOrDeleteTablesOnTestDb)(undefined, false);
            });
            it(`should return the expected API response (arrays index ${i})`, async () => {
                await (0, common_functions_1.checkApiSuccessResponse)(config.testApiCallUrl, server_1.default, expectedApiSuccessResponse[i]);
            });
        });
    }
}
//# sourceMappingURL=common_test_suites.js.map