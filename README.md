# [🪩 MixTo: Una web app dedicata ai DJ](https://github.com/stefadb/DJ_SOCIAL_NETWORK_MIXTO)

## Web app del mio portfolio sviluppata in **React** + Express + MySQL

## [🌐 Puoi visitare MixTo qui](https://mixto.up.railway.app)

## Introduzione

MixTo è una web app **dedicata ai DJ** che permette sia di scroprire nuovi **mix** da provare nelle loro esibizioni sia di condividerli con gli altri utenti della piattaforma.
I DJ possono dare la loro opinione sui mix pubblicati **scrivendo commenti o votando**.
Tutti i **brani**, gli **album**, gli **artisti** e i **generi** musicali, vengono restituiti dalla [API pubblica di DEEZER developers](https://developers.deezer.com/login?redirect=/api)

## Dati di esempio

### 🧑🏻‍💻 Utenti di test

Sono presenti i seguenti **username di test**: *alerossi90, beawhite89, dineri2000, fragialli95, gioverdi78, giuwhite75, manurossii, marossi99, marros99, paneri98, stefadb*
Tutti questi utenti entrano con la password *ABCDE*

### 🎶 Mix, commenti e valutazioni di test

L'app contiene molti **mix**, **commenti** e **valutazioni** di test in diverse pagine. Seguono alcune tra quelle più rilevanti:

[Pagina dell'artista 'Chris Stussy'](https://mixto.up.railway.app/artista?id=5359276)

[Pagina dell'artista 'Kolter'](https://mixto.up.railway.app/artista?id=6164532)

[Pagina dell'utente @stefadb](https://mixto.up.railway.app/utente?id=5)

## Implementazione

### ⚛️ Tecnologie usate

- **Front-end**
  - **React** con **React Router** per una navigazione rapida tra le pagine e le modal dell'app
  - **Typescript** con **Zod** per una validazione completa e a runtime dei tipi di dato nel codice, soprattutto per i dati restituiti dal back-end
  - **Tailwind CSS** per rendere il codice dello stile più leggibile e avere padding più coerenti
  - **Redux** per gestire lo stato globale nell'app e evitare il "props drilling"
- **Back-end**
  - **Node.js** con **Express** per l'implementazione delle API interne
  - **Axios** con **Bottleneck** per effettuare chiamate API a DEEZER rispettando il limite di 50 richieste ogni 5 secondi
  - **Typescript** con **Zod** per una validazione completa e a runtime dei tipi di dato nel codice
  - **Jest** per il testing automatico di tutte le API di ```GET```
- **Database**
  - **MySQL** per la persistenza di tutti i dati, comprese le copie locali dei brani associati ai mix pubblicati e alle liste di brani preferiti degli utenti

### 🛠️ Funzioni e codice ancora da sviluppare

- Possibilità di **pubblicare** e **generare** automaticamente le **tracklist**, cioè le **sequenze complete di mix**, che diventano quindi liste di brani complete per i DJ.
- **Test** automatici sul front-end con qualche libreria dedicata, ad esempio **Jest**
- **Test** automatici delle API di ```POST```, ```PUT``` e ```DELETE``` sul back-end
- **Ordinamento** personalizzato delle liste di **mix** e **tracklist**

## Come eseguire l'app localmente

Una volta scaricato o clonato il repository:

1) Aprire sia la cartella ```client-react``` che ```server``` sul command prompt ed eseguire i due comandi ```npm install``` e ```npm run dev``` su entrambe le cartelle.

2) Creare lo schema ```mixto``` sul db MySQL e importare i dati dal file ```DUMP_mixto.sql```

3) Creare lo schema ```mixto_api_calls``` sul db MySQL e importare i dati dal file ```DUMP_mixto_api_calls.sql```
