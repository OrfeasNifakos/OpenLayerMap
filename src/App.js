import React, { useState, useCallback } from 'react';
import axios from 'axios';
import MapComponent from './components/mapComponent';
import LocationForm from './components/LocationForm';
import './App.css';
import { fromLonLat } from 'ol/proj';


function App() {
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [routeGeometry, setRouteGeometry] = useState(null);

  

  const addLocation = useCallback(({ name, lon, lat }) => {
    console.log('Adding location:', { name, lon, lat }); 
    setLocations((locs) => [...locs, { id: Date.now(), name, lon, lat }]);
  }, []);

  const deleteLocation = useCallback((id) => {
    setLocations((locs) => locs.filter(location => location.id !== id));
  }, []);

  const renameLocation = useCallback((id, newName) => {
    setLocations((locs) => locs.map(location => 
      location.id === id ? { ...location, name: newName } : location
    ));
  }, []);

  const moveLocation = useCallback((id, direction) => {
    setLocations((locs) => {
      const index = locs.findIndex(location => location.id === id);
      if (index < 0) return locs;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex === locs.length) return locs;

      const newLocations = [...locs];
      const [removed] = newLocations.splice(index, 1);
      newLocations.splice(newIndex, 0, removed);

      return newLocations;
    });
  }, []);

  const toggleLocationSelection = useCallback((locationId) => {
    setSelectedLocations((currentSelected) => {
      if (currentSelected.includes(locationId)) {
        return currentSelected.filter(id => id !== locationId);
      } else {
        return [...currentSelected, locationId];
      }
    });
  }, []);

  const calculateAndDisplayRoute = useCallback(async () => {
    const routeCoords = selectedLocations.map(id => {
      const loc = locations.find(location => location.id === id);
      return [loc.lon, loc.lat];
    });
  
    if (routeCoords.length < 2) {
      alert('Please select at least two locations.');
      return;
    }

    const start = routeCoords[0].join(',');
  const end = routeCoords[routeCoords.length - 1].join(',');
  
    try {
      const response = await axios.get(
        'https://api.openrouteservice.org/v2/directions/driving-car', 
        {
          params: {
            api_key: process.env.REACT_APP_DIRECTION_API, 
            start: start,
            end: end
          }
        }
      );
  
      const routeData = response.data.features[0].geometry.coordinates;
      setRouteGeometry(routeData.map(coord => fromLonLat(coord))); 
      console.log(routeData); 

    } catch (error) {
      console.error('Routing API error:', error);
    }
  }, [selectedLocations, locations, setRouteGeometry]);

  return (
    <div className="App">
      <MapComponent onMapClick={addLocation} routeGeometry={routeGeometry} locations={locations} />


      <LocationForm onAdd={addLocation} />

     <ul className="location-list">
  {locations.map(location => (
    <li key={location.id}>
      <input 
        type="checkbox"
        checked={selectedLocations.includes(location.id)}
        onChange={() => toggleLocationSelection(location.id)}
      />
      <input 
        type="text"
        value={location.name}
        onChange={(e) => renameLocation(location.id, e.target.value)}
      />
      <span>Lon: {location.lon && location.lon.toFixed(5)}, Lat: {location.lat && location.lat.toFixed(5)}</span>
      <div>
        <button onClick={() => moveLocation(location.id, 'up')}>Up</button>
        <button onClick={() => moveLocation(location.id, 'down')}>Down</button>
        <button onClick={() => deleteLocation(location.id)} className="delete">Delete</button>
      </div>
    </li>
  ))}
</ul>

<button onClick={calculateAndDisplayRoute} className="button calculate-route">Calculate Route</button>
    </div>
  );
}

export default App;
