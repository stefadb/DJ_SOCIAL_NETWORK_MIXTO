"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = commonDeezerGetTestSuite;
const server_1 = __importDefault(require("../src/server"));
const common_functions_1 = require("./common_functions");
function commonDeezerGetTestSuite(testConfig, mockDeezerResponseRaw, expectedApiSuccessResponse, expectedDbUpsertResult, mockedAxios) {
    const picturesFolder = testConfig.picturesFolder;
    const deezerApiCallUrl = testConfig.deezerApiCallUrl;
    const apiName = testConfig.apiName;
    const testApiCallUrl = testConfig.testApiCallUrl;
    const entityName = testConfig.entityName;
    const upsertTestSqlQuery = testConfig.upsertTestSqlQuery;
    describe(`GET ${apiName}`, () => {
        //Configurazione dei mock delle API
        beforeEach(async () => {
            await (0, common_functions_1.createOrDeleteTablesOnTestDb)(false, false);
            await (0, common_functions_1.createOrDeleteTablesOnTestDb)(true, true);
            await (0, common_functions_1.prepareMocksForDeezerResponseAndImages)(mockDeezerResponseRaw, picturesFolder, deezerApiCallUrl, mockedAxios);
        });
        afterEach(async () => {
            await (0, common_functions_1.createOrDeleteTablesOnTestDb)(false, false);
            await jest.clearAllMocks();
        });
        //Descrizioni dei test
        it(`should return the same ${entityName} that Deezer returns`, async () => {
            await (0, common_functions_1.checkApiSuccessResponse)(testApiCallUrl, server_1.default, expectedApiSuccessResponse);
        });
        it(`should upsert to the db the same ${entityName} that Deezer returns`, async () => {
            await (0, common_functions_1.checkDbUpsert)(upsertTestSqlQuery, testApiCallUrl, server_1.default, expectedDbUpsertResult);
        });
        if (picturesFolder) {
            it(`should upload the photo/photos of the same ${entityName} that Deezer returns`, async () => { await (0, common_functions_1.testPicturesDownload)(picturesFolder, mockDeezerResponseRaw, testApiCallUrl, server_1.default); });
        }
    });
}
//# sourceMappingURL=common_test_suites.js.map