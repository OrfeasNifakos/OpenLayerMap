import React from 'react';

function LocationForm({ onAdd }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const { name, longitude, latitude } = event.target.elements;

    const lon = parseFloat(longitude.value);
    const lat = parseFloat(latitude.value);

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      alert('Please enter valid coordinates (longitude: -180 to 180, latitude: -90 to 90)');
      return;
    }
    onAdd({
      name: name.value.trim(),
      lon: parseFloat(longitude.value),
      lat: parseFloat(latitude.value),
    });
    event.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="coordinate-form">
      <input name="name" type="text" placeholder="Location name" required />
      <input name="longitude" type="text" placeholder="Longitude" required />
      <input name="latitude" type="text" placeholder="Latitude" required />
      <button type="submit" className="coordinate-form button">Add Location</button>

    </form>
  );
}

export default LocationForm;