import axios from "axios";
import { QueryParams } from "./types";
import path from "path";
import fs from "fs";
import { ZodIntersection, ZodObject } from "zod";
import { GenericDeezerEntityBasic, GenericDeezerEntityBasicSchema } from "./deezer_types";

const deezerAPIUrl = "https://api.deezer.com";

/**
 * Funzione comoda per effettuare chiamate API a Deezer
 * URL reale: https://api.deezer.com/[urlFirstPart]/[urlParameter]/[urlSecondPart]?[queryParams]
 * @param res L'oggetto che la funzione può usare per rispondere direttamente in caso di errori
 * @param queryParams Tutti i query params della chiamata API rappresentati come oggetto JSON
 */
export async function makeDeezerApiCall(res: import("express").Response, urlFirstPart: string | null, urlParameter: string | number | null, urlSecondPart: string | null, queryParams: QueryParams | null) : Promise<axios.AxiosResponse<any, any> | -1> {
  return new Promise((resolve) => {
    let url = deezerAPIUrl;
    if (urlFirstPart) {
      url += `/${urlFirstPart}`;
    }
    if (urlParameter) {
      url += `/${urlParameter}`;
    }
    if (urlSecondPart) {
      url += `/${urlSecondPart}`;
    }
    if (queryParams) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
    }
    axios.get(url)
      .then((response) => {
        if (response.status == 200) {
          resolve(response);
        } else {
          res.status(response.status).json({ error: `Errore nella chiamata a Deezer: ${response.statusText}` });
          resolve(-1);
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          res.status(404).json({ error: "Deezer non ha trovato quello che si sta cercando" });
          resolve(-1);
        } else {
          res.status(500).json({ error: "Errore nella chiamata a Deezer" });
          resolve(-1);
        }
      });
  });
}

//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function uploadPhoto(dirName: string, entity: GenericDeezerEntityBasic) {
  let pictureUrl: string;
  if ("picture_big" in entity || "cover_big" in entity || "picture" in entity) {
    pictureUrl = "picture_big" in entity ? entity.picture_big : "cover_big" in entity ? entity.cover_big : entity.picture;
  } else {
    //Nessuna immagine da caricare
    return;
  }
  const picturesDir = path.join(__dirname, dirName);
  if (!fs.existsSync(picturesDir)) {
    fs.mkdirSync(picturesDir);
  }
  return new Promise((resolve, reject) => {
    const picturesDir = path.join(__dirname, dirName);
    const imgPath = path.join(picturesDir, `${entity.id}.jpg`);
    try {
      axios.get(pictureUrl, { responseType: "stream" })
        .then((imgResponse) => {
          const writer = fs.createWriteStream(imgPath);
          imgResponse.data.pipe(writer);
          writer.on("finish", () => { resolve("Upload della foto completato"); });
          writer.on("error", () => { reject(); });
        })
        .catch((error) => {
          reject(error);
        });
    } catch (imgErr) {
      reject(imgErr);
    }
  });
}

/**
 * Restituisce true se l'oggetto Deezer è valido, false altrimenti
 */
//FUNZIONE GIA ADATTATA A TYPESCRIPT
export function isValidDeezerObject<T extends ZodObject<any>>(res: import("express").Response, obj: any, schema: ZodIntersection<typeof GenericDeezerEntityBasicSchema, T>) {
  const safeParseResult = schema.safeParse(obj);
  if (!safeParseResult.success) {
    console.log(safeParseResult.error);
    res.status(500).json({ error: "L'oggetto restituito da Deezer non segue lo schema.", details: safeParseResult.error });
  }
  return safeParseResult.success;
}