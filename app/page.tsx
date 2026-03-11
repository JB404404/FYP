'use client'
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""
  })

  var location = { lat: 43, lng: 177 };
  const geolocation = navigator.geolocation;
  geolocation?.getCurrentPosition((position) => {
    location.lat = position.coords.latitude;
    location.lng = position.coords.longitude;
  });
  return !isLoaded ? (
    <span>Loading</span>
  ) : (
    Map(location)
  )
}

function Map(location: { lat: number, lng: number }) {
  return <GoogleMap zoom={10} center={location} mapContainerClassName="google-map-container">
    <Marker position={location}></Marker>
  </GoogleMap>
}
