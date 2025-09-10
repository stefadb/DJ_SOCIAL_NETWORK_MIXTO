// Carica tutti i JSON di configurazione del test
import mockDeezerResponseRaw from "./mock_deezer_response.json";
import expectedApiSuccessResponse from "./expected_api_success_response.json";

import testConfig from "./test_config.json";
import commonDeezerGetTestSuite from "../common_test_suites";
import axios from "axios";

//Configurazione di axios mock
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

commonDeezerGetTestSuite(testConfig, mockDeezerResponseRaw, expectedApiSuccessResponse, mockedAxios);