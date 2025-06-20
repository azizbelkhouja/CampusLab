CampusLab è una piattaforma completa progettata per semplificare la gestione e la fruizione dei laboratori universitari. Offre strumenti intuitivi sia per gli studenti, che possono prenotare facilmente postazioni PC, sia per i docenti, che possono organizzare seminari, gestire risorse e monitorare l’utilizzo dei laboratori in tempo reale.

## Funzionalità principali

- **Prenotazione postazioni PC:** Gli studenti possono consultare la disponibilità aggiornata delle postazioni nei diversi laboratori, prenotare quelle libere e gestire le proprie prenotazioni in modo semplice e veloce.
- **Gestione seminari:** Un admin la possibilità di creare, modificare e pianificare seminari o eventi, assegnando risorse specifiche (come postazioni, aule o dispositivi) e monitorando la partecipazione degli studenti.
- **Calendario integrato:** Un calendario interattivo consente a tutti gli studenti di visualizzare prenotazioni, eventi e disponibilità delle risorse in tempo reale, facilitando la pianificazione e l’organizzazione personale.
- **Sistema di notifiche:** Notifiche automatiche all’interno della piattaforma avvisano gli utenti di prenotazioni imminenti, modifiche agli seminari o aggiornamenti importanti.
- **Gestione utenti e ruoli:** Accesso differenziato per studenti, e amministratori, con permessi personalizzati per garantire sicurezza e controllo sulle funzionalità disponibili.
- **Supporto multi-laboratorio:** Possibilità di gestire più laboratori e sedi universitarie da un’unica piattaforma centralizzata.

## Tecnologie utilizzate

CampusLab è sviluppato utilizzando tecnologie moderne per garantire scalabilità, sicurezza e facilità di manutenzione:

- **Frontend:** React, per un’interfaccia utente dinamica e responsiva.
- **Backend:** Node.js con Express per la gestione della logica applicativa e delle API.
- **Database:** NoSQL (MongoDB) per l’archiviazione sicura dei dati.
- **Autenticazione:** Implementazione di protocolli sicuri come JWT per la gestione dell’accesso e la protezione dei dati sensibili.

## Come iniziare

Per iniziare a utilizzare CampusLab, segui questi semplici passaggi:

1. **Clona il repository:**
    ```bash
    git clone https://github.com/azizbelkhouja/CampusLab.git
    ```
2. **Installa le dipendenze:**
    ```bash
    cd client
    npm install
    npm run dev
    ```
3. **Configura le variabili d’ambiente:**  
   Crea un file `.env` seguendo il template fornito e inserisci le credenziali necessarie per database e autenticazione.
   ```bash
   DATABASE = <your_database_url>
   JWT_SECRET= <any random JWT secret>
   JWT_EXPIRE= 30d
   JWT_COOKIE_EXPIRE= 30
   ```
4. **Avvia l’applicazione:**
    ```bash
    cd server
    npm install
    npm start
    ```
5. **Accedi alla piattaforma:**  
   Una volta avviata, la piattaforma sarà accessibile all’indirizzo `http://localhost:5173`.

## Contribuire

Contribuire a CampusLab è semplice e apprezzato! Puoi:

- Segnalare bug o proporre nuove funzionalità aprendo una [issue](https://github.com/azizbelkhouja/CampusLab/issues)
- Inviare una pull request con miglioramenti o correzioni
- Partecipare alle discussioni e aiutare a migliorare la documentazione

CampusLab nasce per rendere più efficiente e trasparente la gestione dei laboratori universitari, favorendo la collaborazione tra studenti, docenti e amministratori.
