import app from "../src/server";
import dbInitInsertQueries from "./entities_crud_tests/db_init_insert_queries.json";
import { checkApiSuccessResponse, checkDbUpsert, createOrDeleteTablesOnTestDb, prepareMocksForDeezerResponse} from "./common_functions";
import { DeezerGetTestSuiteTestConfig, GetApiTestSuiteTestConfig } from "./types";
import { DeezerResponseDataItemsArray, DeezerResponseSingleItem } from "../src/deezer_types";
import axios from "axios";
import { getDbTablesAndColumns } from "../src/get_db_tables_and_columns";


export function commonDeezerGetTestSuite(testConfig: DeezerGetTestSuiteTestConfig, mockDeezerResponseRaw: DeezerResponseSingleItem | DeezerResponseDataItemsArray, expectedApiSuccessResponse: Object, mockedAxios: jest.Mocked<typeof axios>) {
    const deezerApiCallUrl = testConfig.deezerApiCallUrl;
    const apiName = testConfig.apiName;
    const testApiCallUrl = testConfig.testApiCallUrl;
    const entityName = testConfig.entityName;
    describe(`GET ${apiName}`, () => {
        //Configurazione dei mock delle API
        beforeEach(async () => {
            await getDbTablesAndColumns();
            await createOrDeleteTablesOnTestDb(undefined, false);
            await createOrDeleteTablesOnTestDb(testConfig.queriesAfterDbInit, true);
            await prepareMocksForDeezerResponse(mockDeezerResponseRaw, deezerApiCallUrl, mockedAxios);
        });
        afterEach(async () => {
            await createOrDeleteTablesOnTestDb(undefined, false);
            await jest.clearAllMocks();
        });

        //Descrizioni dei test

        it(`should return the same ${entityName} that Deezer returns`, async () => {
            await checkApiSuccessResponse(testApiCallUrl, app, expectedApiSuccessResponse);
        });

        for (const dbUpsertTest of testConfig.dbUpsertTests) {
            it(`should upsert to the db the same ${dbUpsertTest.entityName} that Deezer returns`, async () => {
                await checkDbUpsert(dbUpsertTest.sqlQuery, testApiCallUrl, app, dbUpsertTest.expectedResult);
            });
        }
    });
}

export function commonGetApiTestSuite(testConfig: GetApiTestSuiteTestConfig, expectedApiSuccessResponse: Object[]) {
    for (const [i, config] of testConfig.entries()) {
        if (expectedApiSuccessResponse[i] === undefined) {
            throw new Error(`Expected API success response at index ${i} is undefined. Please check the expectedApiSuccessResponse array.`);
        }
        //PROBLEMA: Qui expectedApiSuccessResponse[index] as Object è definito, mentre dentro il test it() è undefined
        describe(`GET ${config.testApiCallUrl}`, () => {
            //Configurazione dei mock delle API
            beforeEach(async () => {
                await getDbTablesAndColumns();
                await createOrDeleteTablesOnTestDb(undefined, false);
                await createOrDeleteTablesOnTestDb(dbInitInsertQueries as string[], true);
            });
            afterEach(async () => {
                await createOrDeleteTablesOnTestDb(undefined, false);
            });

            it(`should return the expected API response (arrays index ${i})`, async () => {
                await checkApiSuccessResponse(config.testApiCallUrl, app, expectedApiSuccessResponse[i] as Object);
            });
        });
    }
}