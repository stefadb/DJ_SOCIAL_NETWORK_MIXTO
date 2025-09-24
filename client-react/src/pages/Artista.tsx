import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
    AlbumDbSchema,
    ArtistaDbSchema,
    BranoDbSchema,
    PassaggioDbSchema,
    type AlbumDb,
    type ArtistaDb,
    type BranoDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardAlbum from "../components/cards/CardAlbum";
import CardBrano from "../components/cards/CardBrano";
import CardArtista from "../components/cards/CardArtista";
import z from "zod";

// Schema e type per /passaggi?artistaSecondoBrano= e /passaggi?artistaPrimoBrano=
const PassaggioConBraniSchema = PassaggioDbSchema.extend({
    brano_1_array: z.array(BranoDbSchema),
    brano_2_array: z.array(BranoDbSchema)
});
type PassaggioConBrani = z.infer<typeof PassaggioConBraniSchema>;

function Artista() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [artista, setArtista] = useState<ArtistaDb | null>(null);

    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadArtista();
    }, []);

    async function loadArtista() {
        try {
            await api.get(`/artisti/singolo?artistId=${id}&limit=1&index=0`);
            await api.get(`/album/artista?artistId=${id}&limit=1&index=0`);
            const responseArtista = await api.get(`/artisti/esistenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            ArtistaDbSchema.parse(responseArtista.data);
            setArtista(responseArtista.data as ArtistaDb);
        } catch (error) {
            //TODO: Gestire errore
            console.error("Errore nel recupero dell'artista:", error);
        }
    }

    return (
        <div>
            <h1>Artista</h1>
            {artista ? (
                <div>
                    <img style={{ width: "200px", height: "200px", borderRadius: "50%" }} src={"http://localhost:3000/artisti_pictures/" + artista.id + ".jpg"} alt={"Immagine di profilo di " + artista.nome} />
                    <h2>{artista.nome}</h2>
                    <p>Generi: --ancora non so come farli vedere-- //TODO:</p>
                </div>
            ) : (
                <p>Caricamento...</p>
            )}
            {artista !== null &&
                <>
                    <div>
                        <h2>Album dell'artista</h2>
                        <PagedList itemsPerPage={5} apiCall={`/album/artista?artistId=${artista.id}`} schema={AlbumDbSchema} component={(element: AlbumDb) => (
                            <CardAlbum key={element.id} album={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri album</button>} />
                    </div>
                    <div>
                        <h2>Brani dell'artista più popolari su Deezer</h2>
                        <PagedList itemsPerPage={5} apiCall={`/brani/artista?artistId=${artista.id}`} schema={BranoDbSchema} component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri brani</button>} />
                    </div>
                    <div>
                        <h2>Artisti simili a {artista.nome}</h2>
                        <PagedList itemsPerPage={5} apiCall={`/artisti/simili?artistId=${artista.id}`} schema={ArtistaDbSchema} component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri artisti</button>} />
                    </div>
                    <div>
                        <h2>Cosa mettere prima di un brano di {artista.nome}?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?artistaSecondoBrano=${artista.id}`}
                            schema={PassaggioConBraniSchema}
                            component={(element: PassaggioConBrani) => (
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                />
                            )}
                            showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>}
                        />
                    </div>
                    <div>
                        <h2>E dopo?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?artistaPrimoBrano=${artista.id}`}
                            schema={PassaggioConBraniSchema}
                            component={(element: PassaggioConBrani) => (
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                />
                            )}
                            showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>}
                        />
                    </div>
                </>
            }
        </div>
    );
}

export default Artista;
