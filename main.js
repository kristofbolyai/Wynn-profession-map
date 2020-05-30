var map;

$(document).ready(function () {
    run();
});


let data;

async function run() {
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
    data = await axios.get('https://cors-anywhere.herokuapp.com/https://wynnpendium.ehtycscythe.com/api/node_list.php?prof=all');
    data = data.data;
    console.log(data);

}

let markers = [[],[],[],[]];

async function reload(changed)
{
    setTimeout(() => {
        let elements = document.getElementsByName('cm');
        for (let i = 0; i < 4; i++) {
            if (!elements[i].checked) 
            {
                if (i === changed)
                {
                    markers[i].forEach(element => {
                        map.removeLayer(element);
                    });
                    markers[i] = [];
                }
                continue;
            }
            for (const x in data[elements[i].id.toLowerCase()]) {
                //console.log(data[elements[i].id.toLowerCase()][x]);
                setTimeout(() => {
                    for (const y of data[elements[i].id.toLowerCase()][x].locations) {
                        setTimeout(() => {
                            let marker = L.marker([y.z*0.001*-1, y.x*0.001]).addTo(map);
                            marker.bindPopup(`<b>${x}</b><br>LVL ${data[elements[i].id.toLowerCase()][x].level}<br>X: ${y.x}<br>Y: ${y.y}<br>Z: ${y.z}`);
                            markers[i].push(marker);
                        }, 1);
                        //console.log(y);
                    }
                }, 1);
            }
            
        }
    }, 1);
}
