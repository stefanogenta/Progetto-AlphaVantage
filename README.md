# Progetto-AlphaVantage
Progetto scolastico, sito di borsa con dati presi da alpha vantage(nel progetto non sono stati caricati i file aggiuntivi per la librearia MyMapLibre siccome non é consentito l'upload di troppi file)

# FUNZIONALITA'

# 1 INTESTAZIONE
Nella prima riga di intestazione, che rimane sempre fissata in alto durante la navigazione, sono presenti un 2 button. Il button a forma di grafico riporta in cima alla pagine e il button con l'icona del sole serve per cambiare il tema chiaro/scuro

# 2 SELEZIONE AZIENDA
Nella card di selezione dell'azienda e possibile seleziona un'azienda tra quelle presenti oppure e possibile cerca l'azienda desiderata tramite l'apposita textbox che implementa una ricerca incrementale

# 3 BUTTON QUOTAZIONE
Questo button serve per caricare tutti i dati(tranne il grafico) tra cui la tabella contenente le generalità dell'azienda, le stats rapide ovvero le quotazioni dell'azienda seleziona e la mappa a fondo pagine che può anche essere chiusa tramite il button X

# 4 BUTTONS PER IL GRAFICO
Una volta cliccato il button quotazione appaiono i 3 select button per scegliere i dati del grafico e il pulsante carica grafico che appunto permette la visualizzazione del grafico. In seguito al click sul pulsante carica grafico appare un altro button per scaricare il grafico come file.png

# 5 BUTTON AGGIORNA DATI(non funzionante)
Questo button fa una richiesta GET al DB locale e poi fa una richiesta ad alpha vantage per ogni symbol corrispondente. Infine fa una 3 richiesta PUT per aggiornare il DB locale, ma putroppo non viene aggiornato per un errore su quest'ultima richiesta
