import React, { useRef, useEffect, memo } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { toLonLat, fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point'; 
import LineString from 'ol/geom/LineString';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style, Icon } from 'ol/style'; 


const MapComponent = memo(({ onMapClick, routeGeometry, locations }) => {
  const mapElement = useRef();
  const map = useRef();
  const routeLayer = useRef(new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: '#ff3333',
        width: 2
      })
    })
  }));
  const locationLayer = useRef(new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      image: new Icon({
        src: './logo.svg',
        scale: 0.05, 
      })
    })
  }));

  useEffect(() => {
    map.current = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        routeLayer.current,
        locationLayer.current
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      })
    });

    map.current.on('singleclick', function(e) {
      const [lon, lat] = toLonLat(e.coordinate);
      onMapClick({ name: 'New Location', lon, lat });
    });

    return () => map.current.setTarget(undefined);
  }, [onMapClick]);

  useEffect(() => {
  if (routeGeometry && routeGeometry.length > 0 && map.current) {
    
    const routeFeature = new Feature({
      geometry: new LineString(routeGeometry),
    });

    
    if (!routeLayer.current) {
      routeLayer.current = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          stroke: new Stroke({
            color: '#ffcc33', 
            width: 3, 
          }),
        }),
      });
      map.current.addLayer(routeLayer.current);
    }

    
    routeLayer.current.getSource().clear();
    routeLayer.current.getSource().addFeature(routeFeature);

    
    const extent = routeFeature.getGeometry().getExtent();
    
    
    if (extent && extent.some(coord => isFinite(coord))) {
      
      map.current.getView().fit(extent, {
        padding: [100, 100, 100, 100], 
        maxZoom: 16, 
        duration: 1000 
      });
    } else {
      console.error('Invalid extent for route feature:', extent);
    }
  }
}, [routeGeometry]);

useEffect(() => {
  if (locations && locations.length > 0 && map.current) {
    console.log('Rendering locations on map:', locations);
    const locationFeatures = locations.map(loc => {
      return new Feature({
        geometry: new Point(fromLonLat([loc.lon, loc.lat])),
      });
    });

    locationLayer.current.getSource().clear();
    locationLayer.current.getSource().addFeatures(locationFeatures);
  }
}, [locations]);
  

  return <div ref={mapElement} className="map-container"/>;
});

export default MapComponent;
