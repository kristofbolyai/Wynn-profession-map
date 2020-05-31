var map;

$(document).ready(function () {
    run();
});

let list = ["farming", "mining", "woodcutting", "fishing"]

let data, sorted;

async function run() {
    setTimeout(async () => {
        data = await axios.get('https://cors-anywhere.herokuapp.com/https://wynnpendium.ehtycscythe.com/api/node_list.php?prof=all');
        data = data.data;
        sorted = [[], [], [], []];
        for (const x in data) {
            let i = list.indexOf(x);
            if (i !== -1) {
                let current = data[x];
                for (const y in current) {
                    let object = current[y];
                    object.name = y;
                    sorted[i].push(object);
                }
                sorted[i] = sorted[i].sort((a, b) => {
                    return b.level - a.level;
                });
            }
        }
        let elements = document.getElementsByName('ts');
        elements.forEach((element) => {
            let o = document.createElement("option");
            o.text = "All";
            element.add(o);
            element.selectedIndex = 0;
            let i = list.indexOf(element.id.toLowerCase());
            for (const x of sorted[i]) {
                let option = document.createElement("option");
                option.text = `${x.name} (Level ${x.level})`;
                element.add(option);
            }
        });
    }, 1);
    let bounds = [];
    let images = [];

    map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: 6,
        maxZoom: 10,
        zoomControl: false,
        zoom: 8
    });

    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    map.fitBounds([[0, -4], [6, 2]]);

    for (let a = 0; a < 4; a++) {
        for (let b = 0; b < 3; b++) {
            bounds.push([[a * 2, (2 * b) - 4], [(a + 1) * 2, (2 * (b + 1)) - 4]])
        }
    }

    for (let bound of bounds) {
        images.push(L.imageOverlay(`./tiles/${bound[0][1]}/${bound[0][0]}.png`,
            bound, {
            attribution: "<a href='https://wynndata.tk/map'>WYNNDATA</a>"
        }
        ));
    }

    for (let image of images) {
        image.addTo(map);
    }

    let prevZoom = 7;


    map.on('zoomend', () => {
        prevZoom = map.getZoom();
    });
}

let markers = [[], [], [], []];

async function reload(changed) {
    console.log("reloading!")
    setTimeout(() => {
        let elements = document.getElementsByName('cm');
        let selectors = document.getElementsByName('ts');
        let counts = document.getElementsByName('pc');
        [0,1,2,3].forEach(async (ic) => {
            let i = ic;
                if (i === changed) {
                    markers[i].forEach(async (element) => {
                        map.removeLayer(element);
                    });
                    markers[i] = [];
                }
                if (!elements[i].checked) return;
                let count = 0;
                for (const x in data[elements[i].id.toLowerCase()]) {
                    if (selectors[i].selectedIndex === 0 || selectors[i].options[selectors[i].selectedIndex].text.toLowerCase().startsWith(x.toLowerCase())) {
                        setTimeout(() => {
                            for (const y of data[elements[i].id.toLowerCase()][x].locations) {
                                setTimeout(() => {
                                    let marker = L.marker([y.z * 0.001 * -1, y.x * 0.001]).addTo(map);
                                    marker.bindPopup(`<b>${x}</b><br>LVL ${data[elements[i].id.toLowerCase()][x].level}<br>X: ${y.x}<br>Y: ${y.y}<br>Z: ${y.z}`);
                                    markers[i].push(marker);
                                }, 1);
                                ++count;
                                counts[i].innerText = `Count: ${count}`;
                                //console.log(y);
                            }
                        }, 1);
                    }
                }
        });
    }, 1);
}
