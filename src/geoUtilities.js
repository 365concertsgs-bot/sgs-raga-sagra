/**
 * Geospatial utility functions for global coordinate handling
 * Supports all hemispheres: Northern/Southern (latitude) and Eastern/Western (longitude)
 */

/**
 * Validates if coordinates are within valid global ranges
 * Latitude: -90° to 90° (South to North)
 * Longitude: -180° to 180° (West to East)
 * 
 * @param {number} lat - Latitude coordinate
 * @param {number} lng - Longitude coordinate
 * @returns {boolean} true if coordinates are valid
 */
export const isValidCoordinate = (lat, lng) => {
  if (lat === null || lng === null || lat === undefined || lng === undefined) {
    return false;
  }
  
  const latNum = Number(lat);
  const lngNum = Number(lng);
  
  return (
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
};

/**
 * Haversine formula: calculates great-circle distance between two points
 * on Earth given their longitude and latitude
 * 
 * Supports all hemispheres:
 * - Positive latitude: Northern Hemisphere
 * - Negative latitude: Southern Hemisphere (Australia, South America, South Africa)
 * - Positive longitude: Eastern Hemisphere
 * - Negative longitude: Western Hemisphere (Americas)
 * 
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lng1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lng2 - Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const toRad = (degree) => (degree * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Check if a coordinate is within a certain radius of another coordinate
 * Useful for location-based filtering
 * 
 * @param {number} lat - Target latitude
 * @param {number} lng - Target longitude
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {boolean} true if coordinate is within radius
 */
export const isWithinRadius = (lat, lng, centerLat, centerLng, radiusKm) => {
  if (!isValidCoordinate(lat, lng) || !isValidCoordinate(centerLat, centerLng)) {
    return false;
  }
  
  const distance = haversineDistance(lat, lng, centerLat, centerLng);
  return distance <= radiusKm;
};

/**
 * Get hemisphere information for a coordinate
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} Object with hemisphere names
 */
export const getHemisphere = (lat, lng) => {
  return {
    vertical: lat >= 0 ? 'Northern' : 'Southern',
    horizontal: lng >= 0 ? 'Eastern' : 'Western',
  };
};

/**
 * Normalize longitude to -180 to 180 range
 * Handles wrap-around for dates line
 * 
 * @param {number} lng - Longitude value
 * @returns {number} Normalized longitude
 */
export const normalizeLongitude = (lng) => {
  let normalized = lng % 360;
  if (normalized > 180) {
    normalized -= 360;
  } else if (normalized < -180) {
    normalized += 360;
  }
  return normalized;
};

/**
 * Calculate bounding box for all events in a hemisphere or region
 * Useful for auto-centering the globe
 * 
 * @param {array} events - Array of event objects with lat/lng properties
 * @returns {object} Bounding box with min/max lat/lng
 */
export const getBoundingBox = (events) => {
  if (!events || events.length === 0) {
    return null;
  }
  
  const validEvents = events.filter((e) => isValidCoordinate(e.lat, e.lng));
  
  if (validEvents.length === 0) {
    return null;
  }
  
  const lats = validEvents.map((e) => e.lat);
  const lngs = validEvents.map((e) => e.lng);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
    centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
};
