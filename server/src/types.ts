import { ZodIntersection } from "zod";
import { GenericDeezerEntityBasicSchema } from "./deezer_types";
import { DbEntity } from "./db_types";

export type QueryParams = Record<string, string>;

export type DeezerEntityAPIConfig = {
  paramName: string;
  deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => Promise<any>;
}

export type DeezerEntityAPIsConfig = Record<string, DeezerEntityAPIConfig>;