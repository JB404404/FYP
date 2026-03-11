import { GoogleMapsEmbed } from '@next/third-parties/google'

export default function Home() {
  var location = undefined;
  const geolocation = navigator.geolocation;
  geolocation?.getCurrentPosition((position)=>{
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    location = `${lat}, ${lng}`
    location = `${43}, ${177}`
  });
  return location == undefined ? (
    <GoogleMapsEmbed
      apiKey="AIzaSyCg0OB3NMGcGkGIhBKodyMwVv2rrrPFXZ0"
      height="100%"
      width="100%"
      mode="place"
    /> 
  ) : (<GoogleMapsEmbed
      apiKey="AIzaSyCg0OB3NMGcGkGIhBKodyMwVv2rrrPFXZ0"
      height="100%"
      width="100%"
      mode="place"
      q={location}
    />)
}
