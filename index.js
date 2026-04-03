"use strict";

let MAPSTYLE = myMapLibre.darkStyle;
const ZOOM = 5.2;
const JSON_SERVER = "http://localhost:3000";
const APIKEY = "V54DOT7JE2ESWHCQ";
const ALPHAVANTAGE = "https://www.alphavantage.co/query";
const QUOTE = "/GLOBAL_QUOTE";
const OVERVIEW = "/OVERVIEW";
const TIME_SERIES = "/TIME_SERIES_MONTHLY";
const SYMOBOL_SEARCH = "/SYMBOL_SEARCH";

let chart;
btnLoadChart.style.display = "none";
btnSaveChart.style.display = "none";
fieldSelect.style.display = "none";
chartTypeSelect.style.display = "none";
periodSelect.style.display = "none";
btnDatiAzienda.disabled = true;

//#region AGGIORNAMENTO ORARIO LIVE
function updateNavClock() {
    const now = new Date();
    let hours = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()
    let timeText;
    if (seconds < 10) {
        timeText = `${hours}:${minutes}:0${seconds}`;
    }
    else if (minutes < 10) {
        timeText = `${hours}:0${minutes}:${seconds}`;
    }
    else if (hours < 10) {
        timeText = `0${hours}:${minutes}:${seconds}`;
    }
    else {
        timeText = `${hours}:${minutes}:${seconds}`;
    }
    const clockText = document.getElementById("navClock");
    clockText.textContent = timeText;
}
updateNavClock();
setInterval(updateNavClock, 1000);
//#endregion



//#region BUTTON CAMBIO TEMA
let btnToggleTheme = document.getElementsByClassName("btnToggleTheme")[0];
btnToggleTheme.addEventListener("click", function () {
    document.body.classList.toggle("light-theme");
})
//#endregion



//#region TICKER DI MERCATO
function stampaTicker(quote) {
    const tickerBox = document.getElementById("tickerBox");
    tickerBox.innerHTML = "";
    quote.forEach(item => {
        let symbol = item.symbol;
        let changePercent = item["10. change percent"]
        let string = String(changePercent)
        if (parseFloat(string) >= 0) {
            let span = document.createElement("span");
            span.className = "ticker-item up";
            span.innerHTML = `· ${symbol} ${changePercent}`;
            tickerBox.appendChild(span);
        }
        else {
            let span = document.createElement("span");
            span.className = "ticker-item down";
            span.innerHTML = `· ${symbol} ${changePercent}`;
            tickerBox.appendChild(span);
        }
    });
}

async function getQuote() {
    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${QUOTE}`).catch(ajax.errore);
    if (httpResponse) {
        stampaTicker(httpResponse.data);
    }
}

getQuote();
setInterval(getQuote, 30000);
//#endregion



//#region CARICAMENTO LISTBOX CON LE AZIENDE

let lstAziende = document.getElementById("lstAziende");

async function caricaAziende() {
    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${OVERVIEW}`).catch(ajax.errore);
    if (httpResponse) {
        let data = httpResponse.data;
        for (let azienda of data) {
            let option = document.createElement("option");
            option.value = azienda.Symbol;
            option.textContent = azienda.Name;
            lstAziende.appendChild(option);
        }
    }
}
caricaAziende();

lstAziende.addEventListener("change", function () {
    btnDatiAzienda.disabled = false;
    btnLoadChart.style.display = "none";
    btnSaveChart.style.display = "none";
    searchInput.value = ""
    fieldSelect.style.display = "none";
    chartTypeSelect.style.display = "none";
    periodSelect.style.display = "none";
    myMapLibre.map = null;
    nascondiTabellaDati();
    mainChart.style.display = "none";
    containerTableDati.classList.add("d-none");
    quoteEmpty.classList.remove("d-none");
    statsPanel.innerHTML = "";
    wrapMappa.style.display = "none";
    myMapLibre.map = null;
});

//#endregion



//#region RICERCA INCREMENTATA
const searchInput = document.getElementById("inputRicerca");
const searchResults = document.getElementById("searchResults");

function mostraRisultatiAziende(input) {
    searchResults.innerHTML = "";

    if (!(input === "")) {
        let trovati = false;

        for (let option of lstAziende.options) {
            if (option.value === "") continue;

            if (option.textContent.toLowerCase().startsWith(input.toLowerCase())) {
                let item = document.createElement("div");
                item.className = "search-result-item";
                item.dataset.value = option.value;

                let spanNome = document.createElement("span");
                spanNome.textContent = option.textContent;

                let spanSymbol = document.createElement("span");
                spanSymbol.className = "search-result-symbol";
                spanSymbol.textContent = option.value;

                item.appendChild(spanNome);
                item.appendChild(spanSymbol);
                searchResults.appendChild(item);

                trovati = true;
            }
        }

        if (!trovati) {
            let item = document.createElement("div");
            item.className = "search-result-item";
            item.textContent = "Nessuna azienda trovata";
            searchResults.appendChild(item);
        }
    }


}

searchInput.addEventListener("input", function () {
    mostraRisultatiAziende(this.value);
});

searchResults.addEventListener("click", function (event) {
    let item = event.target;
    if (!item.classList.contains("search-result-item")) {
        item = item.parentElement;
    }
    let valore = item.dataset.value;
    let nome = item.querySelector("span").textContent;
    lstAziende.value = valore;
    searchInput.value = nome;
    searchResults.innerHTML = "";
});


//#endregion



//#region PULSANTE DATI AZIENDA


function mostraTabellaDati() {
    quoteEmpty.classList.add("d-none");
    containerTableDati.classList.add("d-none");
    quoteLoading.classList.remove("d-none");
}

function nascondiTabellaDati() {
    quoteLoading.classList.add("d-none");
}

function stampaDati(azienda) {
    if (!azienda) {
        nascondiTabellaDati();
        quoteEmpty.classList.remove("d-none");
        return;
    }

    let symbol = azienda["1. symbol"];
    let name = azienda["2. name"];
    let type = azienda["3. type"];
    let region = azienda["4. region"];
    let marketOpen = azienda["5. marketOpen"];
    let marketClose = azienda["6. marketClose"];
    let timezone = azienda["7. timezone"];
    let currency = azienda["8. currency"];

    console.log(symbol)
    simboloAzienda.textContent = symbol;
    const tbody = document.getElementById("tbodyDati");
    tbody.innerHTML = "";

    let tr = document.createElement("tr");

    let campi = [symbol, name, type, region, marketOpen, marketClose, timezone, currency];
    for (let valore of campi) {
        let td = document.createElement("td");
        td.textContent = valore;
        tr.appendChild(td);
    }

    tbody.appendChild(tr);
    nascondiTabellaDati();
    containerTableDati.classList.remove("d-none");
}
async function caricaDati() {
    let aziendaSelezionata = lstAziende.value;
    mostraTabellaDati();

    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${SYMOBOL_SEARCH}`).catch(ajax.errore);
    if (httpResponse) {
        let aziende = httpResponse.data;
        let azienda;
        for (let item of aziende) {
            if (item["1. symbol"] == aziendaSelezionata) {
                azienda = item;
            }
        }

        stampaDati(azienda);
    }
}

btnDatiAzienda.addEventListener("click", function () {
    caricaDati();
    btnDatiAzienda.disabled = false;
    aggiornaStatsPanel();
    wrapMappa.style.display = "";
    btnLoadChart.style.display = "";
    chartEmpty.style.display = "";
    mainChart.style.display = "none";
    let aziendaSelezionata = lstAziende.value;
    mapContainer.innerHTML = "";
    fieldSelect.style.display = "";
    chartTypeSelect.style.display = "";
    periodSelect.style.display = "";
    caricaMappa(aziendaSelezionata);
});


//#endregion



//#region STATS RAPIDE



async function aggiornaStatsPanel() {
    const statsPanel = document.getElementById("statsPanel");
    statsPanel.innerHTML = "";

    let symbol = lstAziende.value;
    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${QUOTE}`).catch(ajax.errore);
    if (!httpResponse) return;

    let quota = null;
    for (let item of httpResponse.data) {
        if (item.symbol == symbol) {
            quota = item;
        }
    }

    if (!quota) return;

    let div1 = document.createElement("div");
    div1.className = "stats-item";

    let label1 = document.createElement("div");
    label1.className = "stats-item-label";
    label1.textContent = "Prezzo Attuale";

    let value1 = document.createElement("div");
    value1.className = "stats-item-value text-gold";
    value1.textContent = "$" + (parseFloat(quota["05. price"]))

    div1.appendChild(label1);
    div1.appendChild(value1);
    statsPanel.appendChild(div1);


    let div2 = document.createElement("div");
    div2.className = "stats-item";

    let label2 = document.createElement("div");
    label2.className = "stats-item-label";
    label2.textContent = "Variazione";

    let value2 = document.createElement("div");
    value2.className = "stats-item-value";

    let change = parseFloat(quota["09. change"]);
    let changePct = quota["10. change percent"];

    value2.textContent = (change >= 0 ? "+" : "") + changePct;

    if (change >= 0) value2.classList.add("text-green");
    else value2.classList.add("text-red");

    div2.appendChild(label2);
    div2.appendChild(value2);
    statsPanel.appendChild(div2);



    let div3 = document.createElement("div");
    div3.className = "stats-item";

    let label3 = document.createElement("div");
    label3.className = "stats-item-label";
    label3.textContent = "Apertura";

    let value3 = document.createElement("div");
    value3.className = "stats-item-value";
    value3.textContent = "$" + quota["02. open"];

    div3.appendChild(label3);
    div3.appendChild(value3);
    statsPanel.appendChild(div3);


    let div4 = document.createElement("div");
    div4.className = "stats-item";

    let label4 = document.createElement("div");
    label4.className = "stats-item-label";
    label4.textContent = "Max Giornaliero";

    let value4 = document.createElement("div");
    value4.className = "stats-item-value";
    value4.textContent = "$" + quota["03. high"];

    div4.appendChild(label4);
    div4.appendChild(value4);
    statsPanel.appendChild(div4);


    let div5 = document.createElement("div");
    div5.className = "stats-item";

    let label5 = document.createElement("div");
    label5.className = "stats-item-label";
    label5.textContent = "Min Giornaliero";

    let value5 = document.createElement("div");
    value5.className = "stats-item-value";
    value5.textContent = "$" + quota["04. low"];

    div5.appendChild(label5);
    div5.appendChild(value5);
    statsPanel.appendChild(div5);


    let div6 = document.createElement("div");
    div6.className = "stats-item";

    let label6 = document.createElement("div");
    label6.className = "stats-item-label";
    label6.textContent = "Volume";

    let value6 = document.createElement("div");
    value6.className = "stats-item-value";
    value6.textContent = quota["06. volume"];

    div6.appendChild(label6);
    div6.appendChild(value6);
    statsPanel.appendChild(div6);
}

//#endregion



//#region GRAFICO STORICO



async function caricaGrafico() {
    let symbol = lstAziende.value;
    let periodo = periodSelect.value;
    let chartType = chartTypeSelect.value;
    let field = fieldSelect.value;

    let nMesi;

    switch (periodo) {
        case "1m":
            nMesi = 1;
            break;
        case "3m":
            nMesi = 3;
            break;
        case "6m":
            nMesi = 6;
            break;
        case "1y":
            nMesi = 12;
            break;
        default:
            nMesi = 1;
    }

    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${TIME_SERIES}`).catch(ajax.errore);
    if (httpResponse) {

        let datiAzienda = null;

        for (let i = 0; i < httpResponse.data.length; i++) {
            if (httpResponse.data[i].symbol == symbol) {
                datiAzienda = httpResponse.data[i];
            }
        }

        let serieStorica = datiAzienda["Monthly Time Series"];

        let date = Object.keys(serieStorica).slice(0, nMesi).reverse();

        let valori = [];
        let colori = [];

        for (let i = 0; i < date.length; i++) {
            let d = date[i];
            valori.push(parseFloat(serieStorica[d][field]));
            colori.push("rgba(204, 166, 41, 0.6)");
        }

        myBarChart.setChartOptions(symbol + " — " + periodo, date, valori, colori);

        let opzioni = myBarChart.getChartOptions();
        opzioni.type = chartType;

        if (chart) {
            chart.destroy();
        }

        chartEmpty.style.display = "none";
        mainChart.style.display = "block";

        let canvas = document.getElementById("mainChart");
        chart = new Chart(canvas.getContext("2d"), opzioni);
    }
}

btnLoadChart.addEventListener("click", function () {
    caricaGrafico();
    btnSaveChart.style.display = "";
});

btnSaveChart.addEventListener("click", function () {
    let canvas = document.getElementById("mainChart");
    myBarChart.setWhiteBackground(canvas);
    let link = document.createElement("a");
    link.download = `${lstAziende.value}_chart.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
});

//#endregion



//#region MAPPA

async function caricaMappa(aziendaSelezionata) {
    myMapLibre.map = null;
    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${OVERVIEW}`).catch(ajax.errore);
    if (!httpResponse) return;

    let azienda = null;
    for (let item of httpResponse.data) {
        if (item.Symbol == aziendaSelezionata) {
            azienda = item;
        }
    }

    let indirizzo = azienda.Address;
    mapAddressLabel.textContent = indirizzo;

    let mapContainer = document.getElementById("mapContainer");
    mapContainer.innerHTML = "";
    mapContainer.classList.remove("map-placeholder");
    mapContainer.style.height = "420px";

    let gps = await myMapLibre.geocode(indirizzo);
    if (!gps) return;
    await myMapLibre.drawMap(MAPSTYLE, "mapContainer", gps, ZOOM);
    await myMapLibre.addMarker(gps, "", "", `<b>${azienda.Name}</b>`);
}

btnCloseMap.addEventListener("click", function () {
    wrapMappa.style.display = "none";
    myMapLibre.map = null;
});

//#endregion



//#region  AGGIORNAMENTO DATABASE(non funzionante)
async function aggiornaDatabase() {
    let httpResponse = await ajax.sendRequest("GET", `${JSON_SERVER}${QUOTE}`).catch(ajax.errore);
    if (httpResponse) {
        let nuoveQuote = [];
        for (let item of httpResponse.data) {

            let httpResponse2 = await ajax.sendRequest("GET", `${ALPHAVANTAGE}?function=GLOBAL_QUOTE&symbol=${item.symbol}&apikey=${APIKEY}`).catch(ajax.errore);
            console.log(httpResponse2.data)
            if (httpResponse2 && httpResponse2.data["Global Quote"]?.["01. symbol"]) {
                let globalQuoteAggiornato = httpResponse2.data["Global Quote"];
                nuoveQuote.push({
                    symbol: globalQuoteAggiornato["01. symbol"],
                    "01. symbol": globalQuoteAggiornato["01. symbol"],
                    "02. open": globalQuoteAggiornato["02. open"],
                    "03. high": globalQuoteAggiornato["03. high"],
                    "04. low": globalQuoteAggiornato["04. low"],
                    "05. price": globalQuoteAggiornato["05. price"],
                    "06. volume": globalQuoteAggiornato["06. volume"],
                    "07. latest trading day": globalQuoteAggiornato["07. latest trading day"],
                    "08. previous close": globalQuoteAggiornato["08. previous close"],
                    "09. change": globalQuoteAggiornato["09. change"],
                    "10. change percent": globalQuoteAggiornato["10. change percent"]
                });
            }
            let httpResponse3 = await ajax.sendRequest("PUT", `${JSON_SERVER}${QUOTE}/${item.symbol}`, nuoveQuote).catch(ajax.errore);
            if (httpResponse3) {
                location.reload();
            }
        }


    }
}

// btnUpdateDB.addEventListener("click", function () {
//     aggiornaDatabase();
// });

//#endregion
