mapboxgl.accessToken = 'pk.eyJ1IjoidmFsdWVjcmVhdGlvbiIsImEiOiJja2swcm9pdWMwazk2MnB0ZzZ5NTVwMXAxIn0.9klPq_GB5cZ0lRZVdZR2_g';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [139.657125, 35.661236],
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
      "<div><b>COVIT-19 Risk（02/01/2023)</b></div>" + 
      "<div>" + Math.round(e.features[0].properties.PTC_2020) + " people</div>")
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

let PTC_2020_1 = ["<", ["get", "PTC_2020"], 4001];
let PTC_2020_2 = ["all", [">=", ["get", "PTC_2020"], 4001], ["<", ["get", "PTC_2020"], 4556]];
let PTC_2020_3 = ["all", [">=", ["get", "PTC_2020"], 4556], ["<", ["get", "PTC_2020"], 5112]];
let PTC_2020_4 = ["all", [">=", ["get", "PTC_2020"], 5112], ["<", ["get", "PTC_2020"], 5667]];
let PTC_2020_5 = ["all", [">=", ["get", "PTC_2020"], 5667], ["<", ["get", "PTC_2020"], 6223]];
let PTC_2020_6 = ["all", [">=", ["get", "PTC_2020"], 6223], ["<", ["get", "PTC_2020"], 6778]];
let PTC_2020_7 = ["all", [">=", ["get", "PTC_2020"], 6778], ["<", ["get", "PTC_2020"], 7334]];
let PTC_2020_8 = ["all", [">=", ["get", "PTC_2020"], 7334], ["<", ["get", "PTC_2020"], 7889]];
let PTC_2020_9 = ["all", [">=", ["get", "PTC_2020"], 7889], ["<", ["get", "PTC_2020"], 8445]];
let PTC_2020_10 = ["all", [">=", ["get", "PTC_2020"], 8445], ["<", ["get", "PTC_2020"], 9000]];

let colors = ['rgb(5 ,255 ,5)',
           	'rgb(122 ,255 ,122)',
		'rgb(130 ,255 ,5)',
	        'rgb(188 ,255 ,122)',
		'rgb(255 ,255 ,5)',
          	'rgb(255 ,255 ,122)',
		'rgb(255 ,122 ,188)',
         	'rgb(255 ,122 ,122)',
		'rgb(255 ,5 ,130)',
		'rgb(255 ,5 ,5)'] 

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
            PTC_2020_1, colors[0],
            PTC_2020_2, colors[1],
            PTC_2020_3, colors[2],
            PTC_2020_4, colors[3], 
            PTC_2020_5, colors[4], 
            PTC_2020_6, colors[5], 
            PTC_2020_7, colors[6], 
            PTC_2020_8, colors[7], 
            PTC_2020_9, colors[8], 
            PTC_2020_10, colors[9], 
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

let meshGeoJsonURL = 'https://miraimeisatu.github.io/nasa2021/1km_mesh_2018_13.geojson';

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
      <div>${Math.round(object.properties.PTC_2020)}over65</div>
      `;
  } else { 
    tooltip.innerHTML = '';
  }
}

