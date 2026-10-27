'use client';

import { useState, useCallback } from 'react';

export interface GeocodeResult {
  lat: number;
  lng: number;
  country: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  pincode: string;
  fullAddress: string;
  liveLocationUrl: string;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const detectLocation = useCallback(async (): Promise<GeocodeResult | null> => {
    setError(null);
    setSuccessMessage(null);

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('GPS Location detection is not supported by your browser. Please enter your address manually.');
      return null;
    }

    setLoading(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                const data: GeocodeResult = json.data;
                setSuccessMessage(`GPS location detected (${lat.toFixed(4)}, ${lng.toFixed(4)}). Address details auto-filled!`);
                setLoading(false);
                resolve(data);
                return;
              }
            }
          } catch (apiErr) {
            // Geocoding API failed, fallback to raw coordinates
          }

          // Fallback if reverse geocoding API was unreachable
          const fallbackData: GeocodeResult = {
            lat,
            lng,
            country: 'India',
            state: '',
            district: '',
            city: '',
            locality: '',
            pincode: '',
            fullAddress: '',
            liveLocationUrl: `https://www.google.com/maps?q=${lat},${lng}`
          };
          setSuccessMessage(`GPS coordinates detected (${lat.toFixed(4)}, ${lng.toFixed(4)}). Please enter street details.`);
          setLoading(false);
          resolve(fallbackData);
        },
        (geoError) => {
          setLoading(false);
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              setError('Location permission was denied. You can manually enter your address details below, or enable location access in your browser settings.');
              break;
            case geoError.POSITION_UNAVAILABLE:
              setError('GPS location is currently unavailable on this device. Please enter your delivery address manually.');
              break;
            case geoError.TIMEOUT:
              setError('GPS location request timed out. Please try clicking again or enter your address manually.');
              break;
            default:
              setError('Unable to detect GPS location. Please enter your delivery address manually.');
              break;
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    loading,
    error,
    successMessage,
    detectLocation,
    clearMessages
  };
}
