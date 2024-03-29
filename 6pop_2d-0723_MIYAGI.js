mapboxgl.accessToken = 'pk.eyJ1IjoidmFsdWVjcmVhdGlvbiIsImEiOiJja2swcm9pdWMwazk2MnB0ZzZ5NTVwMXAxIn0.9klPq_GB5cZ0lRZVdZR2_g';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [140.712399, 38.3878215],
  zoom: 10, // starting zoom
  pitch: 40
});

/************** Map Control *******************/
map.addControl(new mapboxgl.NavigationControl());

let scale = new mapboxgl.ScaleControl({
  maxWidth: 250,
  unit: 'metric'
});

map.addControl(scale);

// Create a popup, but don't add it to the map yet.
let popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

let hoveredStateId = null;

map.on("mousemove", "2DmeshLayer", function(e) {

  map.getCanvas().style.cursor = 'pointer';

  if (e.features.length > 0) {
      if (hoveredStateId) {
        map.setFeatureState({source: 'meshdata', id: hoveredStateId}, { hover: false});
      }
      hoveredStateId = e.features[0].layer.id;
      map.setFeatureState({source: 'meshdata', id: hoveredStateId}, { hover: true});
  }

  popup.setLngLat(e.lngLat)
    .setHTML(
      "<div><b>City Code &nbsp;</b>" + e.features[0].properties.SHICODE + "</div>" + 
      "<div><b>COVIT-19 Risk（07/23/2022)</b></div>" + 
      "<div>" + Math.round(e.features[0].properties.PT0_2020) + " 人</div>")
    .addTo(map);

});
   
// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
map.on("mouseleave", "2DmeshLayer", function() {
  map.getCanvas().style.cursor = '';
  popup.remove();
  if (hoveredStateId) {
    map.setFeatureState({source: 'meshdata', id: hoveredStateId}, { hover: false});
  }
  hoveredStateId =  null;
});

let PT0_2020_1 = ["<", ["get", "PT0_2020"], 2000];
let PT0_2020_2 = ["all", [">=", ["get", "PT0_2020"], 2000], ["<", ["get", "PT0_2020"], 4000]];
let PT0_2020_3 = ["all", [">=", ["get", "PT0_2020"], 4000], ["<", ["get", "PT0_2020"], 6000]];
let PT0_2020_4 = ["all", [">=", ["get", "PT0_2020"], 6000], ["<", ["get", "PT0_2020"], 8000]];
let PT0_2020_5 = ["all", [">=", ["get", "PT0_2020"], 8000], ["<", ["get", "PT0_2020"], 10000]];
let PT0_2020_6 = ["all", [">=", ["get", "PT0_2020"], 10000], ["<", ["get", "PT0_2020"], 12000]];
let PT0_2020_7 = ["all", [">=", ["get", "PT0_2020"], 12000], ["<", ["get", "PT0_2020"], 14000]];
let PT0_2020_8 = ["all", [">=", ["get", "PT0_2020"], 14000], ["<", ["get", "PT0_2020"], 16000]];
let PT0_2020_9 = ["all", [">=", ["get", "PT0_2020"], 16000], ["<", ["get", "PT0_2020"], 18000]];
let PT0_2020_10 = ["all", [">=", ["get", "PT0_2020"], 18000], ["<", ["get", "PT0_2020"], 20000]];

let colors = ['rgb(44, 123, 182)',
           	'rgb(100, 165, 205)',
		'rgb(157, 207, 228)',
	        'rgb(199, 230, 219)',
		'rgb(237, 247, 201)',
          	'rgb(255, 237, 170)',
		'rgb(254, 201, 128)',
         	'rgb(249, 158, 89)',
		'rgb(232, 91, 58)',
		'rgb(215, 25, 28)'] 

const meshToMap = (meshdata) => {
 
  map.addSource('meshdata',{
    type: 'geojson',
    data: meshdata,
  });

  map.addLayer({
    'id': '2DmeshLayer',
    'type': 'fill',
    'source': 'meshdata',
    'layout': {},
    'paint': {
        "fill-color": 
          ["case",
            PT0_2020_1, colors[0],
            PT0_2020_2, colors[1],
            PT0_2020_3, colors[2],
            PT0_2020_4, colors[3], 
            PT0_2020_5, colors[4], 
            PT0_2020_6, colors[5], 
            PT0_2020_7, colors[6], 
            PT0_2020_8, colors[7], 
            PT0_2020_9, colors[8], 
            PT0_2020_10, colors[9], 
            colors[9]
          ],
        "fill-outline-color": "white",
        "fill-opacity": ["case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5
        ]
      }
  });

};

let meshGeoJsonURL = 'https://miraimeisatu.github.io/nasa2021/1km_mesh_2018_MIYAGI.json';

const handleGetData = (err, meshdata) => {
  meshToMap(meshdata);
}

d3.queue()
  .defer(d3.json, meshGeoJsonURL)
  .await(handleGetData);

function updateTooltip({x, y, object}) {
  const tooltip = document.getElementById('tooltip');
  if (object) {
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = `
      <div><b>Tile ID &nbsp;</b></div>
      <div><div>${object.properties.SHICODE}</div></div>
      <div><b>Risk</b></div>
      <div>${Math.round(object.properties.PT0_2020)}全人口</div>
      `;
  } else { 
    tooltip.innerHTML = '';
  }
}

