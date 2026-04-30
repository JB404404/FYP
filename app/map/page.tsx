'use client'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
let map: any = null;
let searchMarkers: Array<google.maps.Marker> = [];
export default function Home() {
  const { isLoaded: isMapAPILoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY || '',
    libraries: ['maps', 'marker']
  })

  if (!isMapAPILoaded) {
    return <span>Loading</span>
  } else {
    return Map() as any as google.maps.MapElement;
  }
}

function Map() {
  let location = { coords: new google.maps.LatLng({ lat: 51.509865, lng: -0.118092 }) }
  const geolocation = navigator.geolocation;
  geolocation?.getCurrentPosition((position) => {
    location.coords = new google.maps.LatLng(
      { lat: position.coords.latitude, lng: position.coords.longitude }
    )
  });

  let choices = {
    restaurant: false,
    park: false,
    cafe: false
  };

  return <GoogleMap onLoad={(newMap) => { map = newMap }} id={"1"} zoom={10} center={location.coords} mapContainerClassName='google-map-container'>
    <Marker position={location.coords}></Marker>
    <span className='map-options'>
      <button onClick={async () => { choices.restaurant = !choices.restaurant }} className="map-button-toggle-on">Restaurants</button>
      <button onClick={async () => { choices.park = !choices.park }} className="map-button-toggle-on">Parks</button>
      <button onClick={async () => { choices.cafe = !choices.cafe }} className="map-button-toggle-on">Cafe</button>

      <button onClick={async () => { searchNearby(location, choices) }} className="map-button">Search nearby</button>
    </span>
    <span className='map-options'>
      <button onClick={async () => { window.location.href = "/google-login" }} className="map-button">Log in with google</button>
    </span>
    <span className='map-options'>
      <button onClick={async () => { window.location.href = "/api/createGroup" }} className="map-button">Create group</button>
      <button onClick={async () => { window.location.href = "/api/addUserToGroup" }} className="map-button">Add to group</button>
    </span>
  </GoogleMap>
}

async function searchNearby(location: { coords: google.maps.LatLng }, choices: { restaurant: boolean, park: boolean, cafe: boolean }) {
  if (!Object.values(choices).find((item) => { return item == true })) {
    console.log("no choices selected")
    return;
  };

  const body = {
    'includedTypes': [...choices.restaurant ? ['restaurant'] : [], ...choices.park ? ['park'] : [], ...choices.cafe ? ['cafe'] : []],
    'maxResultCount': 10,
    'locationRestriction': {
      'circle': {
        'center': {
          'latitude': location.coords.lat(),
          'longitude': location.coords.lng()
        },
        'radius': 500.0
      }
    }
  }

  // console.log("cancelling request to minimize API requests from testing")
  // return

  let response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.location'
    }
  })
  let responseJson = await response.json()
  console.log(responseJson)
  let places: Array<{ displayName: { text: string }, location: { latitude: number, longitude: number } }> = responseJson.places
  places.forEach((place) => {
    searchMarkers.push(
      new google.maps.Marker({
        position: new google.maps.LatLng({ lat: place.location.latitude, lng: place.location.longitude }),
        map: map,
        title: place.displayName.text
      })
    )
  })
}
