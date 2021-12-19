mapboxgl.accessToken = 'pk.eyJ1IjoiZnV0dXJlLWZvcmVjYXN0LWFpIiwiYSI6ImNrdGwzYWRxMzFybnoycm1wZ3oyZXV0Y2wifQ.34YElQZ1g_u1VNlhAgWcfQ';
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 16,
    center: [139.777948 ,35.630199],
    pitch: 85,
    bearing: -45,
    style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'
});

map.on('load', function () {
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    // 既存の3D建物レイヤを追加
    map.addLayer({
        "id": "3d-buildings",
        "source": "composite",
        "source-layer": "building",
        "filter": ["==", "extrude", "true"],
        "type": "fill-extrusion",
        "minzoom": 10,
        "paint": {
            "fill-extrusion-color": "#ffffff",
            "fill-extrusion-height": [
                "interpolate", ["linear"], ["zoom"],
                10, 0,
                14.05, ["get", "height"]
            ],
            "fill-extrusion-base": [
                "interpolate", ["linear"], ["zoom"],
                10, 0,
                14.05, ["get", "min_height"]
            ],
            "fill-extrusion-opacity": 1.0
        }
    });
    //土砂災害計画区域ポリゴン追加
    map.addSource("MapPolygon", {
        type: "geojson",
        data: "A46-a-20_22.geojson"
    });
    //地滑り
    map.addLayer({
        id: "MapPolygon3",
        type: "fill",
        source: "MapPolygon",
        layout: {},
        paint: {
            "fill-color": "#ffa500",
            "fill-opacity": 0.5
        },
        filter: ["==", "A46-a_", "003"]
    });
    //土石流
    map.addLayer({
        id: "MapPolygon2",
        type: "fill",
        source: "MapPolygon",
        layout: {},
        paint: {
            "fill-color": "#ffff00",
            "fill-opacity": 0.5
        },
        filter: ["==", "A46-a_", "002"]
    });
    //急傾斜地の崩壊
    map.addLayer({
        id: "MapPolygon1",
        type: "fill",
        source: "MapPolygon",
        layout: {},
        paint: {
            "fill-color": "#ff00ff",
            "fill-opacity": 0.5
        },
        filter: ["==", "A46-a_", "001"]
    });
    //崩壊地等分布図ポリゴン追加
    map.addSource("MapPolygon2", {
        type: "geojson",
        data: "data/Collapsed_Area_20210706.geojson"
    });
    map.addLayer({
        id: "MapPolygon4",
        type: "line",
        source: "MapPolygon2",
        layout: {},
        paint: {
            "line-color": "#ff0000",
            "line-width": 3
        },
    });

    // レイヤ設定
    var Map_AddLayer = {
        MapPolygon1: "土砂災害警戒区域-急傾斜地の崩壊",
        MapPolygon2: "土砂災害警戒区域-土石流",
        MapPolygon3: "土砂災害警戒区域-地滑り"
    };

    // レイヤメニュー作成
    for (var i = 0; i < Object.keys(Map_AddLayer).length; i++) {
        // レイヤID取得
        var id = Object.keys(Map_AddLayer)[i];
        // aタグ作成
        var link = document.createElement("a");
        link.href = "#";
        // id追加
        link.id = id;
        // 名称追加
        link.textContent = Map_AddLayer[id];

        // 初期表示全て表示
        link.className = "active";

        // aタグクリック処理
        link.onclick = function (e) {
            // id取得
            var clickedLayer = this.id;
            e.preventDefault();
            e.stopPropagation();

            // ON/OFF状態取得
            var visibility = map.getLayoutProperty(clickedLayer, "visibility");

            // ON/OFF判断
            if (visibility === 'visible') {
                // クリックしたレイヤを非表示
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
            } else {
                // クリックしたレイヤを表示
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                this.className = 'active';
            }
        };

        // レイヤメニューにレイヤ追加
        var layers = document.getElementById("menu");
        layers.appendChild(link);
    }

});


// コントロール関係表示
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

// スケール表示
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
}));