// Carica tutti i JSON di configurazione del test
import expectedApiSuccessResponse from "./expected_response.json";
import testConfig from "./test_config.json";
import {commonGetApiTestSuite} from "../../../common_test_suites";

commonGetApiTestSuite(testConfig, expectedApiSuccessResponse);
