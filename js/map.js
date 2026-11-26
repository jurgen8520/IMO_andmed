// ============================================================
// KAART
// ============================================================

const map = L.map("map", {
    center: [58.6, 23.6],
    zoom: 7,
    minZoom: 7,
    zoomControl: false
});

L.control.zoom({
    position: "topright"
}).addTo(map);


// ============================================================
// EESTI KAARDI PIIRANG
// ============================================================

const eestiPiir = L.latLngBounds(
    [57.3, 19.0],
    [60.0, 29.3]
);

map.setMaxBounds(eestiPiir);


// ============================================================
// MAA- JA RUUMIAMETI HALLKAART
// ============================================================

L.tileLayer(
    "https://tiles.maaamet.ee/tm/wmts?" +
    "SERVICE=WMTS&" +
    "REQUEST=GetTile&" +
    "VERSION=1.0.0&" +
    "LAYER=hallkaart&" +
    "STYLE=default&" +
    "TILEMATRIXSET=GMC&" +
    "FORMAT=image/png&" +
    "TILEMATRIX={z}&" +
    "TILEROW={y}&" +
    "TILECOL={x}",
    {
        tileSize: 256,
        attribution: "Maa- ja Ruumiamet"
    }
).addTo(map);


// ============================================================
// ÜLDISED SEADED
// ============================================================

let aasta = 2026;
let aktiivneTeema = "tyhi";
let aktiivneKiht = "asumid";
let avatudPopup = null;

// ============================================================
// RUUMIÜKSUSTE KONFIGURATSIOON
// ============================================================

const kihid = {
    ruudustik100: {
        fail: "data/grid100.geojson",
        nimevali: "GRID_100",
        popupLabel: "Ruut",
        radio: "grid100"
    },
    ruudustik250: {
        fail: "data/grid250.geojson",
        nimevali: "GRID_250",
        popupLabel: "Ruut",
        radio: "grid250"
    },
        ruudustik500: {
        fail: "data/grid500.geojson",
        nimevali: "GRID_500",
        popupLabel: "Ruut",
        radio: "grid500"
    },
    ruudustik1000: {
        fail: "data/grid1000.geojson",
        nimevali: "GRD_INSPIR",
        popupLabel: "Ruut",
        radio: "grid1000"
    },
    vaiksedasumid: {
        fail: "data/tallinn_asumid_vaiksed.geojson",
        nimevali: "all_asum_nimi",
        popupLabel: "Asum",
        radio: "vaiksedasumid"
    },
    asumid: {
        fail: "data/Tallinn_asumid.geojson",
        nimevali: "asumi_nimi",
        popupLabel: "Asum",
        radio: "asumid"
    },
    tartuasumid: {
        fail: "data/tartu_asumid.geojson",
        nimevali: "ASUM",
        popupLabel: "Asum",
        radio: "tartuasumid"
    },

    kandid: {
        fail: "data/kandid_2015.geojson",
        nimevali: "KANT_NIMI",
        popupLabel: "Kant",
        radio: "kandid"
    }

};


// ============================================================
// TAUSTAKIHTIDE KONFIGURATSIOON
// ============================================================

const taustKihid = {

    maakonnad: {
        fail: "data/maakond_20260101.geojson",
        nimevali: "MNIMI",
        popupLabel: "Maakond",
        checkbox: "maakonnad",

        style: {
            color: "#232323",
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0
        }
    },

    omavalitsused: {
        fail: "data/omavalitsus_20260101.geojson",
        nimevali: "ONIMI",
        popupLabel: "Omavalitsus",
        checkbox: "omavalitsused",

        style: {
            color: "#232323",
            weight: 1,
            opacity: 0.9,
            fillOpacity: 0
        }
    },

    asustusyksused: {
        fail: "data/asustusyksus_20260101.geojson",
        nimevali: "ANIMI",
        popupLabel: "Asustusüksus",
        checkbox: "asustusyksused",

        style: {
            color: "#232323",
            weight: 0.5,
            opacity: 0.9,
            fillOpacity: 0
        }
    }

};


// ============================================================
// LAADITUD KIHTIDE HOIDLAD
// ============================================================

const laaditudKihid = {};
const laaditudTaustakihid = {};


// ============================================================
// TEEMAD
// ============================================================

const teemad = {

    // --------------------------------------------------------
    // ILMA TEEMATA
    // --------------------------------------------------------

    tyhi: {

        legendTitle: null,
        legend: [],
        legendColor: null,

        style: function () {

            return {
                fillColor: "#ffffff",
                weight: 0.8,
                color: "#0060AA",
                fillOpacity: 0.05
            };

        },

        popupValue: function () {
            return null;
        }

    },


    // --------------------------------------------------------
    // RAHVASTIKUTIHEDUS
    // --------------------------------------------------------

    tihedus: {

        legendTitle: "RAHVASTIKUTIHEDUS",
        legendColor: tiheduseVarv,

        legend: [

            {
                value: 1000,
                tekst: "1000+ in/km²"
            },

            {
                value: 100,
                tekst: "100–999 in/km²"
            },

            {
                value: 50,
                tekst: "50–99 in/km²"
            },

            {
                value: 20,
                tekst: "20–49 in/km²"
            },

            {
                value: 0,
                tekst: "alla 20 in/km²"
            },

            {
                value: null,
                tekst: "Puudub / teadmata"
            }

        ],

        style: function (feature) {

            const arv = leiaTihedus(feature);

            return {
                fillColor: tiheduseVarv(arv),
                weight: 0.7,
                color: "#999999",
                fillOpacity: 0.55
            };

        },

        popupValue: function (feature) {

            const value = leiaTihedus(feature);

            return `
                Rahvastikutihedus:
                ${
                    value === null
                        ? "puudub"
                        : Math.round(value) + " in/km²"
                }
            `;

        }

    },


    // --------------------------------------------------------
    // MUUKEELSETE OSAKAAL
    // --------------------------------------------------------

    emakeel: {

        legendTitle: "MUUKEELSETE OSAKAAL",
        legendColor: muukeelsuseVarv,

        legend: [

            {
                value: 0,
                tekst: "0–9%"
            },

            {
                value: 10,
                tekst: "10–24%"
            },

            {
                value: 25,
                tekst: "25–39%"
            },

            {
                value: 40,
                tekst: "40–59%"
            },

            {
                value: 60,
                tekst: "60–79%"
            },

            {
                value: 80,
                tekst: "80–100%"
            },

            {
                value: null,
                tekst: "Puudub / teadmata"
            }

        ],

        style: function (feature) {

            const osakaal =
                leiaMuukeelseteOsakaal(feature);

            return {
                fillColor: muukeelsuseVarv(osakaal),
                weight: 0.7,
                color: "#e5e5e5",
                fillOpacity: 0.55
            };

        },

        popupValue: function (feature) {

            const value =
                leiaMuukeelseteOsakaal(feature);

            return `
                Muukeelsete osakaal:
                ${
                    value === null
                        ? "puudub"
                        : value + " %"
                }
            `;

        }

    }

};


// ============================================================
// VÄRVISKAALA: RAHVASTIKUTIHEDUS
// ============================================================

function tiheduseVarv(arv) {

    if (
        arv === null ||
        arv === undefined ||
        isNaN(arv)
    ) {
        return "#eeeeee";
    }

    if (arv < 20) {
        return "#f9e7bb";
    }

    if (arv < 50) {
        return "#fde35f";
    }

    if (arv < 100) {
        return "#faa82d";
    }

    if (arv < 1000) {
        return "#fc7100";
    }

    return "#8f0000";
}


// ============================================================
// VÄRVISKAALA: MUUKEELSED
// ============================================================

function muukeelsuseVarv(arv) {

    if (
        arv === null ||
        arv === undefined ||
        isNaN(arv)
    ) {
        return "#eeeeee";
    }

    if (arv < 10) {
        return "#d4c3d9";
    }

    if (arv < 25) {
        return "#bca3c3";
    }

    if (arv < 40) {
        return "#9c80a4";
    }

    if (arv < 60) {
        return "#785f7f";
    }

    if (arv < 80) {
        return "#4d3c52";
    }

    return "#2e2232";
}


// ============================================================
// ELANIKE ARVU LEIDMINE
// ============================================================

function leiaElanikeArv(feature) {

    const aastaKood =
        String(aasta).slice(-2);

    const value =
        feature.properties[
            "elanikke" + aastaKood
        ];

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const arv = Number(value);

    return isNaN(arv)
        ? null
        : arv;
}


// ============================================================
// RAHVASTIKUTIHEDUSE LEIDMINE
// ============================================================

function leiaTihedus(feature) {

    const elanikke =
        leiaElanikeArv(feature);

    if (elanikke === null) {
        return null;
    }

    const pindala =
        Number(
            feature.properties.pindalakm2
        );

    if (
        isNaN(pindala) ||
        pindala <= 0
    ) {
        return null;
    }

    return elanikke / pindala;
}


// ============================================================
// MUUKEELSETE OSAKAALU LEIDMINE
// ============================================================

function leiaMuukeelseteOsakaal(feature) {

    const aastaKood =
        String(aasta).slice(-2);

    const value =
        feature.properties[
            "muukeel" + aastaKood
        ];

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const arv = Number(value);

    return isNaN(arv)
        ? null
        : arv;
}


// ============================================================
// AKTIIVSE TEEMA STIIL
// ============================================================

function stiil(feature) {

    const teema =
        teemad[aktiivneTeema] ||
        teemad.tyhi;

    return teema.style(feature);
}


// ============================================================
// NIME LEIDMINE
// ============================================================

function leiaNimi(feature, nimevali) {

    return (
        feature?.properties?.[nimevali]
        ??
        "Nimetu"
    );

}


// ============================================================
// PUNKTI KUULUMINE RINGI
// ============================================================

function punktRingiSees(latlng, ring) {

    if (
        !ring ||
        ring.length < 3
    ) {
        return false;
    }

    let sees = false;

    const x = latlng.lng;
    const y = latlng.lat;

    for (
        let i = 0, j = ring.length - 1;
        i < ring.length;
        j = i++
    ) {

        const xi = ring[i][0];
        const yi = ring[i][1];

        const xj = ring[j][0];
        const yj = ring[j][1];

        const lõikub =
            ((yi > y) !== (yj > y)) &&
            (
                x <
                (xj - xi) *
                (y - yi) /
                ((yj - yi) || Number.EPSILON)
                + xi
            );

        if (lõikub) {
            sees = !sees;
        }

    }

    return sees;
}


// ============================================================
// PUNKTI KUULUMINE POLÜGOONI
// ============================================================

function punktPolügoonis(
    latlng,
    coordinates
) {

    if (
        !coordinates ||
        coordinates.length === 0
    ) {
        return false;
    }

    if (
        !punktRingiSees(
            latlng,
            coordinates[0]
        )
    ) {
        return false;
    }

    for (
        let i = 1;
        i < coordinates.length;
        i++
    ) {

        if (
            punktRingiSees(
                latlng,
                coordinates[i]
            )
        ) {
            return false;
        }

    }

    return true;
}


// ============================================================
// PUNKTI KUULUMINE FEATURE'I
// ============================================================

function punktFeatureIs(
    latlng,
    feature
) {

    const geometry =
        feature?.geometry;

    if (!geometry) {
        return false;
    }

    if (
        geometry.type === "Polygon"
    ) {

        return punktPolügoonis(
            latlng,
            geometry.coordinates
        );

    }

    if (
        geometry.type === "MultiPolygon"
    ) {

        return geometry.coordinates.some(
            function (polygon) {

                return punktPolügoonis(
                    latlng,
                    polygon
                );

            }
        );

    }

    return false;
}


// ============================================================
// FEATURE LEIDMINE KLIKIKOHAST
// ============================================================

function leiaFeaturePunktist(
    layer,
    latlng
) {

    let leitud = null;

    layer.eachLayer(
        function (featureLayer) {

            if (
                leitud ||
                !featureLayer.feature
            ) {
                return;
            }

            if (
                typeof featureLayer.getBounds ===
                "function" &&
                !featureLayer
                    .getBounds()
                    .contains(latlng)
            ) {
                return;
            }

            if (
                punktFeatureIs(
                    latlng,
                    featureLayer.feature
                )
            ) {

                leitud =
                    featureLayer.feature;

            }

        }
    );

    return leitud;
}


// ============================================================
// POPUPI JAOKS VAJALIKE FEATURE'ITE LEIDMINE
// ============================================================

function leiaPopupFeatureid(latlng) {

    const tulemus = {

        ruumiuksus: null,

        taust: {}

    };


    // Aktiivne ruumiüksus
    const ruumiüksuseKiht =
        laaditudKihid[aktiivneKiht];

    if (ruumiüksuseKiht) {

        tulemus.ruumiuksus =
            leiaFeaturePunktist(
                ruumiüksuseKiht,
                latlng
            );

    }


    // Sisselülitatud taustakihid
    Object.entries(
        taustKihid
    ).forEach(
        function ([kihiNimi, config]) {

            const checkbox =
                document.getElementById(
                    config.checkbox
                );

            if (
                !checkbox ||
                !checkbox.checked
            ) {
                return;
            }


            const layer =
                laaditudTaustakihid[kihiNimi];

            if (!layer) {
                return;
            }


            const feature =
                leiaFeaturePunktist(
                    layer,
                    latlng
                );

            if (feature) {

                tulemus.taust[kihiNimi] =
                    feature;

            }

        }
    );


    return tulemus;
}


// ============================================================
// POPUPI INFO KOOSTAMINE
// ============================================================

function koguPopupInfo(latlng) {

    const leitud =
        leiaPopupFeatureid(latlng);

    const readouts = [];


    // --------------------------------------------------------
    // RUUMIÜKSUS
    // --------------------------------------------------------

    if (leitud.ruumiuksus) {

        const config =
            kihid[aktiivneKiht];

        const nimi =
            leiaNimi(
                leitud.ruumiuksus,
                config.nimevali
            );

        readouts.push(
            `<b>${config.popupLabel}: ${nimi}</b>`
        );


        // Aktiivse teema väärtus
        const teema =
            teemad[aktiivneTeema];

        if (
            teema &&
            typeof teema.popupValue ===
            "function"
        ) {

            const value =
                teema.popupValue(
                    leitud.ruumiuksus
                );

            if (value) {
                readouts.push(value);
            }

        }

    }


    // --------------------------------------------------------
    // TAUSTAKIHTIDE INFO
    // --------------------------------------------------------

    const taustaJärjekord = [

        "asustusyksused",
        "omavalitsused",
        "maakonnad"

    ];


    taustaJärjekord.forEach(
        function (kihiNimi) {

            const feature =
                leitud.taust[kihiNimi];

            if (!feature) {
                return;
            }


            const config =
                taustKihid[kihiNimi];

            const nimi =
                leiaNimi(
                    feature,
                    config.nimevali
                );


            readouts.push(
                `${config.popupLabel}: ${nimi}`
            );

        }
    );


    return readouts.join("<br>");
}


// ============================================================
// POPUPI AVAMINE JA UUENDAMINE
// ============================================================

function avaInfoPopup(latlng) {

    const content =
        koguPopupInfo(latlng) || "Info puudub";


    // Kui popup on juba avatud,
    // uuendame seda, mitte ei loo uut
    if (
        avatudPopup &&
        map.hasLayer(avatudPopup)
    ) {

        avatudPopup
            .setLatLng(latlng)
            .setContent(content);

        return;
    }


    // Uue popupi loomine
    avatudPopup = L.popup({
        maxWidth: 320
    })
        .setLatLng(latlng)
        .setContent(content);


    // Kui kasutaja sulgeb popupi,
    // eemaldame viite sellele
    avatudPopup.on("remove", function() {

        if (avatudPopup === this) {
            avatudPopup = null;
        }

    });


    avatudPopup.openOn(map);

}


// ============================================================
// AVATUD POPUPI SISU UUENDAMINE
// ============================================================

function uuendaAvatudPopup() {

    // Kui popupi pole avatud, pole midagi teha
    if (
        !avatudPopup ||
        !map.hasLayer(avatudPopup)
    ) {
        return;
    }


    // Säilitame klikitud asukoha
    const latlng =
        avatudPopup.getLatLng();


    // Arvutame info uuesti aktiivse aasta,
    // teema ja taustakihtide põhjal
    const content =
        koguPopupInfo(latlng) || "Info puudub";


    avatudPopup.setContent(content);

}


// ============================================================
// RUUMIÜKSUSE KIHI LAADIMINE
// ============================================================

function laeKiht(kihiNimi) {

    const config =
        kihid[kihiNimi];


    return fetch(config.fail)

        .then(
            function (response) {

                if (!response.ok) {

                    throw new Error(
                        `Kihi laadimine ebaõnnestus: ${config.fail}`
                    );

                }

                return response.json();

            }
        )

        .then(
            function (data) {

                const layer =
                    L.geoJSON(
                        data,
                        {

                            style: stiil,

                            onEachFeature:
                                function (
                                    feature,
                                    featureLayer
                                ) {

                                    featureLayer.on(
                                        "click",
                                        function (e) {

                                            avaInfoPopup(
                                                e.latlng
                                            );

                                        }
                                    );

                                }

                        }
                    );


                laaditudKihid[kihiNimi] =
                    layer;


                return layer;

            }
        );
}


// ============================================================
// TAUSTAKIHI LAADIMINE
// ============================================================

function laeTaustakiht(kihiNimi) {

    const config =
        taustKihid[kihiNimi];


    return fetch(config.fail)

        .then(
            function (response) {

                if (!response.ok) {

                    throw new Error(
                        `Taustakihi laadimine ebaõnnestus: ${config.fail}`
                    );

                }

                return response.json();

            }
        )

        .then(
            function (data) {

                const layer =
                    L.geoJSON(
                        data,
                        {

                            style:
                                config.style,

                            onEachFeature:
                                function (
                                    feature,
                                    featureLayer
                                ) {

                                    featureLayer.on(
                                        "click",
                                        function (e) {

                                            avaInfoPopup(
                                                e.latlng
                                            );

                                        }
                                    );

                                }

                        }
                    );


                laaditudTaustakihid[
                    kihiNimi
                ] = layer;


                return layer;

            }
        );
}


// ============================================================
// KÕIKIDE RUUMIÜKSUSE KIHTIDE PEITMINE
// ============================================================

function peidaKõikKihid() {

    Object.values(
        laaditudKihid
    ).forEach(
        function (layer) {

            if (
                map.hasLayer(layer)
            ) {

                map.removeLayer(layer);

            }

        }
    );

}


// ============================================================
// RUUMIÜKSUSE VALIMINE
// ============================================================

function valiKiht(kihiNimi) {

    const layer =
        laaditudKihid[kihiNimi];


    if (!layer) {
        return;
    }


    aktiivneKiht =
        kihiNimi;


    peidaKõikKihid();


    map.addLayer(layer);


    layer.eachLayer(
        function (featureLayer) {

            featureLayer.setStyle(
                stiil(
                    featureLayer.feature
                )
            );

        }
    );


    jarjestaKihid();;

}


// ============================================================
// RUUMIÜKSUSTE STIILI UUENDAMINE
// ============================================================

function uuendaKihiStiil() {

    Object.values(
        laaditudKihid
    ).forEach(
        function (layer) {

            layer.eachLayer(
                function (featureLayer) {

                    featureLayer.setStyle(
                        stiil(
                            featureLayer.feature
                        )
                    );

                }
            );

        }
    );

}


// ============================================================
// TAUSTAKIHTIDE CHECKBOXID
// ============================================================
// ============================================================
// KIHTIDE JÄRJEKORD
// Teemakiht alla, taustakihid peale
// ============================================================

function jarjestaKihid() {

    // Aktiivne ruumiüksus kõigepealt alla
    const aktiivne = laaditudKihid[aktiivneKiht];

    if (aktiivne && map.hasLayer(aktiivne)) {
        aktiivne.bringToBack();
    }

    // Sisselülitatud taustakihid peale
    [
        "maakonnad",
        "omavalitsused",
        "asustusyksused"
    ].forEach(function(kihiNimi) {

        const config = taustKihid[kihiNimi];

        const checkbox =
            document.getElementById(config.checkbox);

        const layer =
            laaditudTaustakihid[kihiNimi];

        if (
            checkbox &&
            checkbox.checked &&
            layer &&
            map.hasLayer(layer)
        ) {
            layer.bringToFront();
        }

    });
}

function seadistaTaustakihid() {

    Object.entries(
        taustKihid
    ).forEach(
        function ([kihiNimi, config]) {

            const checkbox =
                document.getElementById(
                    config.checkbox
                );


            if (!checkbox) {
                return;
            }


            checkbox.addEventListener(
                "change",
                function () {

                    const layer =
                        laaditudTaustakihid[
                            kihiNimi
                        ];


                    if (!layer) {
                        return;
                    }


if (this.checked) {

    map.addLayer(layer);

} else {

    if (map.hasLayer(layer)) {
        map.removeLayer(layer);
    }

}

jarjestaKihid();

                }
            );

        }
    );

}


// ============================================================
// LEGEND
// ============================================================

function uuendaLegend() {

    const legendSection =
        document.getElementById(
            "legendSection"
        );


    const legendTitle =
        document.getElementById(
            "legendTitle"
        );


    const legendContainer =
        document.getElementById(
            "legendContainer"
        );


    const teema =
        teemad[aktiivneTeema];


    // --------------------------------------------------------
    // ILMA TEEMATA
    // --------------------------------------------------------

    if (
        aktiivneTeema === "tyhi" ||
        !teema ||
        !teema.legendTitle
    ) {

        legendSection.style.display =
            "none";

        legendContainer.innerHTML =
            "";

        return;

    }


    // --------------------------------------------------------
    // LEGEND NÄHTAV
    // --------------------------------------------------------

    legendSection.style.display =
        "block";


    legendTitle.textContent =
        teema.legendTitle;


    legendContainer.innerHTML =
        teema.legend
            .map(
                function (item) {

                    const värv =
                        item.value === null
                            ? "#eeeeee"
                            : teema.legendColor(
                                item.value
                            );


                    return `
                        <div class="legendItem">

                            <span
                                class="legendColor"
                                style="background:${värv};"
                            ></span>

                            ${item.tekst}

                        </div>
                    `;

                }
            )
            .join("");

}


// ============================================================
// KIHTIDE LAADIMINE
// ============================================================

Promise.allSettled([

    ...Object.keys(
        kihid
    ).map(
        function (kihiNimi) {
            return laeKiht(kihiNimi);
        }
    ),

    ...Object.keys(
        taustKihid
    ).map(
        function (kihiNimi) {
            return laeTaustakiht(kihiNimi);
        }
    )

])

.then(
    function (tulemused) {

        // Näita konsoolis,
        // kui mõni kiht ei laadunud
        tulemused.forEach(
            function (tulemus) {

                if (
                    tulemus.status ===
                    "rejected"
                ) {

                    console.error(
                        "Ühe kihi laadimine ebaõnnestus:",
                        tulemus.reason
                    );

                }

            }
        );


        // Vaikimisi:
        // kandid + ilma teemata

        aktiivneTeema =
            "tyhi";

        aktiivneKiht =
            "kandid";


        valiKiht(
            "kandid"
        );


        uuendaLegend();


        // Taustakihtide checkboxid
        seadistaTaustakihid();

    }
)

.catch(
    function (error) {

        console.error(
            "Kihtide laadimisel tekkis viga:",
            error
        );

    }
);


// ============================================================
// AASTA SLIDER
// ============================================================

// ============================================================
// AASTA SLIDER
// ============================================================

// Olemasolevad andmeaastad
const AVAILABLE_YEARS = [
    1989,
    2000,
    2011,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
    2026
];

// Leia lähim olemasolev aasta
function getNearestAvailableYear(value) {

    return AVAILABLE_YEARS.reduce(
        function (closest, year) {

            return Math.abs(year - value) <
                   Math.abs(closest - value)
                ? year
                : closest;

        },
        AVAILABLE_YEARS[0]
    );

}


// Slider'i seadistamine
const yearSlider = document.getElementById("yearSlider");

// Slider kasutab kalendriaastaid, mitte indeksit
yearSlider.min = AVAILABLE_YEARS[0];
yearSlider.max = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
yearSlider.step = 1;
yearSlider.value = aasta;

// Algne aastatekst
document.getElementById("yearLabel").textContent = aasta;


// Slider'i liigutamine
yearSlider.addEventListener(
    "input",
    function () {

        // Leia lähim olemasolev andmeaasta
        aasta = getNearestAvailableYear(
            Number(this.value)
        );

        // Slider liigub lähima olemasoleva aastani
        this.value = aasta;

        // Uuenda aastanäitu
        document.getElementById("yearLabel").textContent = aasta;

        // Uuenda kaardi kujundust
        uuendaKihiStiil();

        // Uuenda legendi ja avatud popup'i
        uuendaLegend();
        uuendaAvatudPopup();

    }
);


// ============================================================
// TEEMA VALIMINE
// ============================================================

document
    .getElementById(
        "themeSelect"
    )
    .addEventListener(
        "change",
        function () {

            aktiivneTeema =
                this.value;


            uuendaKihiStiil();


            uuendaLegend();
            uuendaAvatudPopup();

        }
    );


// ============================================================
// RUUMIÜKSUSE RADIO-NUPUD
// ============================================================

Object.entries(
    kihid
).forEach(
    function ([kihiNimi, config]) {

        const radio =
            document.getElementById(
                config.radio
            );


        if (!radio) {
            return;
        }


        radio.addEventListener(
            "change",
            function () {

                if (this.checked) {

                    valiKiht(
                        kihiNimi
                    );

                }

            }
        );

    }
);