import z from "zod";
import { BranoDbSchema, CommentoDbSchema, PassaggioDbSchema, UtenteDbSchema, ValutazioneDbSchema } from "./db_types";

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

// Schema e type per /passaggi?albumPrimoBrano= e /passaggi?albumSecondoBrano=
export const PassaggioConBraniEUtenteSchema = PassaggioDbSchema.extend({
    brano_1_array: z.array(BranoDbSchema),
    brano_2_array: z.array(BranoDbSchema),
    utente_array: z.array(UtenteDbSchema)
});
export type PassaggioConBraniEUtente = z.infer<typeof PassaggioConBraniEUtenteSchema>;

// Schema e type per /passaggi?albumPrimoBrano= e /passaggi?albumSecondoBrano=
export const PassaggioConBrano1EUtenteSchema = PassaggioDbSchema.extend({
    brano_1_array: z.array(BranoDbSchema),
    utente_array: z.array(UtenteDbSchema)
});
export type PassaggioConBrano1EUtente = z.infer<typeof PassaggioConBrano1EUtenteSchema>;

// Schema e type per /passaggi?albumPrimoBrano= e /passaggi?albumSecondoBrano=
export const PassaggioConBrano2EUtenteSchema = PassaggioDbSchema.extend({
    brano_2_array: z.array(BranoDbSchema),
    utente_array: z.array(UtenteDbSchema)
});
export type PassaggioConBrano2EUtente = z.infer<typeof PassaggioConBrano2EUtenteSchema>;

// Schema e type per /passaggi?albumPrimoBrano= e /passaggi?albumSecondoBrano=
export const PassaggioConUtenteSchema = PassaggioDbSchema.extend({
    utente: UtenteDbSchema
});
export type PassaggioConUtente = z.infer<typeof PassaggioConUtenteSchema>;

export const ScratchSchema = z.object({
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
    scratchDepth: z.number()
});

export type Scratch = z.infer<typeof ScratchSchema>;