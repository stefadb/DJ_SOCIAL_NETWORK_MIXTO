import z from "zod";
import { CommentoDbSchema, UtenteDbSchema, ValutazioneDbSchema } from "./db_types";

export const DigitDotDigitSchema = z.string().regex(/^\d+(\.\d+)?$/, "Invalid format, expected digit.digit");
export type DigitDotDigit = z.infer<typeof DigitDotDigitSchema>;

export const ValutazioneEUtenteSchema = ValutazioneDbSchema.extend({
    utente_array: z.array(UtenteDbSchema),
});
export type ValutazioneEUtente = z.infer<typeof ValutazioneEUtenteSchema>;

export const CommentoEUtenteSchema = CommentoDbSchema.extend({
    utente_array: z.array(UtenteDbSchema),
});
export type CommentoEUtente = z.infer<typeof CommentoEUtenteSchema>;