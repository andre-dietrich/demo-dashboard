// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
import mapboxgl from 'mapbox-gl'
import '../node_modules/mapbox-gl/dist/mapbox-gl.css'
import * as echarts from 'echarts'

const coordinates = [[-59.96306, -3.13363]]

for (let i = 0; i < 2000; i++) {
  coordinates.push([
    coordinates[i][0] + Math.random() / 10000,
    coordinates[i][1] + Math.random() / 10000,
  ])
}

const geoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        properties: {},
        coordinates: coordinates,
      },
    },
  ],
}

// https://account.mapbox.com
mapboxgl.accessToken =
  'pk.eyJ1IjoicGFzc2UiLCJhIjoiY2p5eTZ4eDIwMHhrdjNubWVtZGxuYWNscCJ9.FhYjCtWTx_87JbrzJuiFDw'
const map = new mapboxgl.Map({
  container: 'map',
  zoom: 14,
  // position of manaos
  center: [-59.96306, -3.13363],
  pitch: 80,
  bearing: 41,
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  // enable positions through url
  hash: true,
})

map.on('style.load', () => {
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
  })
  // add the DEM source as a terrain layer with exaggerated height
  map.setTerrain({
    source: 'mapbox-dem',
    exaggeration: 1,
  })

  map.addSource('LineString', {
    type: 'geojson',
    data: geoJSON,
  })

  map.addLayer({
    id: 'LineString',
    type: 'line',
    source: 'LineString',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#BF93E4',
      'line-width': 5,
    },
  })
})

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  })
)

// Add a new Marker.
const marker = new mapboxgl.Marker({
  color: '#F84C4C', // color it red
})
marker.setLngLat([-59.97425, -3.1285])
marker.addTo(map)

// Create a default Marker and add it to the map.
new mapboxgl.Marker({ color: 'black', rotation: 45 })
  .setLngLat([-59.96306, -3.63363])
  .addTo(map)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let base = +new Date(1968, 9, 3)
let oneDay = 24 * 3600 * 1000
let date = []
let data = [Math.random() * 300]
for (let i = 1; i < coordinates.length; i++) {
  var now = new Date((base += oneDay))
  date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'))
  data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]))
}

const option = {
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      // move the marker
      marker.setLngLat(coordinates[pt[0] - 1])
      return [pt[0], '10%']
    },
  },
  title: {
    left: 'center',
    text: 'Large Area Chart',
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: 'none',
      },
      restore: {},
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: date,
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%'],
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 10,
    },
    {
      start: 0,
      end: 10,
    },
  ],
  series: [
    {
      name: 'Fake Data',
      type: 'line',
      symbol: 'none',
      sampling: 'lttb',
      itemStyle: {
        color: 'rgb(255, 70, 131)',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgb(255, 158, 68)',
          },
          {
            offset: 1,
            color: 'rgb(255, 70, 131)',
          },
        ]),
      },
      data: data,
    },
  ],
}

function getBoundingBox(data) {
  // bounds [xMin, yMin][xMax, yMax]
  var bounds = [data[0], data[1]]
  var polygon
  var latitude
  var longitude

  for (var i = 2; i < data.length; i++) {
    ;[longitude, latitude] = data[i]

    bounds[0][0] = bounds[0][0] < longitude ? bounds[0][0] : longitude
    bounds[1][0] = bounds[1][0] > longitude ? bounds[1][0] : longitude
    bounds[0][1] = bounds[0][1] < latitude ? bounds[0][1] : latitude
    bounds[1][1] = bounds[1][1] > latitude ? bounds[1][1] : latitude
  }

  console.warn(bounds)
  return bounds
}

var chartDom = document.getElementById('diagram')
if (chartDom) {
  var myChart = echarts.init(chartDom)
  myChart.setOption(option)
  myChart.on('dataZoom', function (evt) {
    console.log('zoom', evt)
    const start = (coordinates.length / 100) * evt.start
    const end = (coordinates.length / 100) * evt.end
    const data = map.fitBounds(
      getBoundingBox(coordinates.slice(Math.abs(start), Math.abs(end)))
    )
  })
}
