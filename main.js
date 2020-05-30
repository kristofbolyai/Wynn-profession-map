var map;

$(document).ready(function () {
    // Inittialize controls
    $('body').bind('keypress', function (e) {
        if (e.target.id === "name") return;
        if (e.which == 32) {
            toggleMenu();
        }
        else if (e.key == "h") {
            visible = !visible;
            if (visible) render();
            else changeVisibility();
        } else if (e.key == "l") {
            toggleLegend();
        }

    })
    run();
});

function initTerrs() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            territories = JSON.parse(this.responseText);
            for (let i in territories) {
                Territories[territories[i].name] = null;
            }
        }
    };
    // xhttp.open("GET", "https://raw.githubusercontent.com/DevScyu/Wynn/master/territories.json", true);
    // xhttp.send();
}

let data;

async function run() {
    //initTerrs();
    // Initializing events
    // initializing map
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

    //initializing variables
    let prevZoom = 7;


    //on zoom end, update map based on zoom
    map.on('zoomend', () => {
        prevZoom = map.getZoom();
    });

    //setInterval(render, 2000)
    //var marker = L.marker([51.5, -0.09]).addTo(mymap);

    data = await axios.get('/api');
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
