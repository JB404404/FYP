'use client'
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { redirect } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

let map: any = null;
const searchMarkers: Array<google.maps.Marker> = [];

const API_KEY = process.env.NEXT_PUBLIC_EMBEDDED_MAP_API_KEY || '';

type routeInfo = {
    steps: any[],
    pathData: any[],
    travelMode: string,
    duration: string
}

type getSet<T> = {
    value: T,
    setValue: Dispatch<SetStateAction<T>>
}

type getSetType = {
    email: getSet<string>,
    lat: getSet<string | undefined>,
    lng: getSet<string | undefined>,
    path: getSet<google.maps.LatLngLiteral[]>,
    routes: getSet<routeInfo[]>,
    arrivalTime: getSet<string | undefined>
    suggestArrivalTime: getSet<string | undefined>,
    clickedLatLng: getSet<{ lat: number, lng: number } | undefined>,
    activity: getSet<string>,
    firstLoad: getSet<boolean>,
    isOwner: getSet<boolean>,
    findingRoute: getSet<boolean>
}

export default function ClientMap({ searchParams }: { searchParams: any }) {

    const stateObject = {
        firstLoad: createState<boolean>(true),
        routes: createState<routeInfo[]>([]),
        path: createState<google.maps.LatLngLiteral[]>([]),
        email: createState<string>(""),
        lat: createState<string | undefined>(searchParams?.lat),
        lng: createState<string | undefined>(searchParams?.lng),
        isOwner: createState<boolean>(Boolean(searchParams?.owner)),
        clickedLatLng: createState<{ lat: number, lng: number } | undefined>(undefined),
        arrivalTime: createState<string | undefined>(searchParams?.arrivalTime),
        suggestArrivalTime: createState<string | undefined>(""),
        activity: createState<string>(""),
        findingRoute: createState<boolean>(false)
    }

    const groupId = searchParams?.id;

    const { isLoaded: isMapAPILoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY || '',
        libraries: ['maps', 'marker', 'geometry']
    })

    if (!isMapAPILoaded) {
        return <div>Loading</div>
    } else {
        const destinationLatLng = new google.maps.LatLng({
            lat: +(searchParams?.lat || 51.509865),
            lng: +(searchParams?.lng || -0.118092)
        })
        return Map(destinationLatLng, groupId, stateObject);
    }
}

function Map(destinationLatLng: google.maps.LatLng, groupId: string, getSet: getSetType) {
    const location = { coords: destinationLatLng }
    const geolocation = navigator.geolocation;
    geolocation?.getCurrentPosition((position) => {
        location.coords = new google.maps.LatLng(
            { lat: position.coords.latitude, lng: position.coords.longitude }
        )
    });

    const choices = {
        restaurant: false,
        park: false,
        cafe: false
    };

    return <GoogleMap onLoad={(newMap) => { map = newMap; if (getSet.firstLoad.value) { map.panTo(location.coords) }; getSet.firstLoad.setValue(false); }} id={"1"} zoom={10} mapContainerClassName='google-map-container'
        onClick={(e) => {
            if (e.latLng) {
                getSet.clickedLatLng.setValue({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
        }}
        onDragStart={() => {
            getSet.clickedLatLng.setValue(undefined)
        }}>
        <Marker position={location.coords}></Marker>
        {getSet.clickedLatLng.value && <Marker position={getSet.clickedLatLng.value} />}

        <Polyline path={getSet.path.value} options={{ strokeColor: "#4285F4", strokeWeight: 4, }} />

        {getSet.isOwner.value && <div className='map-options'>
            <input type="datetime-local" value={getSet.arrivalTime.value} onChange={(e) => getSet.arrivalTime.setValue(e.target.value)} />
            <button onClick={async () => { setGroupArrivalTime(groupId, getSet.arrivalTime.value) }} className='button'>Set group's arrival time</button>
            <input type="datetime-local" value={getSet.suggestArrivalTime.value} onChange={(e) => getSet.suggestArrivalTime.setValue(e.target.value)} />
            <button onClick={async () => { suggestGroupArrivalTime(groupId, getSet.suggestArrivalTime.value) }} className='button'>Suggest group's arrival time</button>
            <button className='button' onClick={() => { getRecommendedActivity(groupId) }}>Get recommended activity</button>
        </div>}

        {getSet.clickedLatLng.value && <div className='map-options'>
            <input className='button'
                type="text"
                value={getSet.activity.value}
                onChange={(e) => getSet.activity.setValue(e.target.value)}
                placeholder="Enter activity..."
            />
            <button onClick={async () => { suggestLocationAndActivity(groupId, getSet.clickedLatLng.value, getSet.activity.value) }} className='button'>Suggest activity at location</button>
        </div>}
        {(getSet.clickedLatLng.value && getSet.isOwner) && <div className='map-options'><button onClick={async () => { setGroupDestination(groupId, getSet.clickedLatLng.value) }} className='button'>Set a group's destination</button></div>}
        {/* <div className='map-options'>
            <button onClick={async () => { choices.restaurant = !choices.restaurant }} className='map-button-toggle-on'>Restaurants</button>
            <button onClick={async () => { choices.park = !choices.park }} className='map-button-toggle-on'>Parks</button>
            <button onClick={async () => { choices.cafe = !choices.cafe }} className='map-button-toggle-on'>Cafe</button>

            <button onClick={async () => { searchNearby(location, choices) }} className='map-button'>Search nearby</button>
        </div> */}
        <div className='map-options'>
            {(!getSet.findingRoute.value) && <button onClick={async () => { getSet.findingRoute.setValue(true) }} className='map-button'>Find route</button>}
            {getSet.findingRoute.value && <button onClick={async () => { getSet.findingRoute.setValue(false) }} className='map-button-toggle-on'>Cancel</button>}

            {getSet.findingRoute.value && <div className='map-options'>
                <button onClick={async () => { findRoute(location, "TRANSIT", getSet); getSet.findingRoute.setValue(false) }} className='map-button-toggle-on'>Public transport</button>
                <button onClick={async () => { findRoute(location, "DRIVE", getSet); getSet.findingRoute.setValue(false) }} className='map-button-toggle-on'>Car</button>
                <button onClick={async () => { findRoute(location, "WALK", getSet); getSet.findingRoute.setValue(false) }} className='map-button-toggle-on'>Walk</button>
            </div>}
        </div>
        <div className='map-options'>
            {getSet.routes.value.map((item: routeInfo, index: number) => (
                <div key={index}>
                    <button className='button' onClick={() => { getSet.path.setValue(item.pathData) }}>{`${item.duration} - ${item.travelMode}`}</button>
                </div>
            ))}
        </div>
    </GoogleMap>
}

function setGroupDestination(groupId: string, latLng: undefined | { lat: number, lng: number }) {
    if (latLng) {
        fetch(`/api/setGroupDestination`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, lat: latLng.lat, lng: latLng.lng }) })
    }
}
function suggestLocationAndActivity(groupId: string, latLng: undefined | { lat: number, lng: number }, activity: string) {
    if (latLng && (activity != "")) {
        fetch(`/api/suggestLocationAndActivity`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, lat: latLng.lat, lng: latLng.lng, activity: activity }) })
    }
}
function setGroupArrivalTime(groupId: string, time: string | undefined) {
    if (time) {
        fetch(`/api/setGroupArrivalTime`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, arrivalTime: time }) })
    }
}

function suggestGroupArrivalTime(groupId: string, time: string | undefined) {
    if (time) {
        fetch(`/api/suggestGroupArrivalTime`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, arrivalTime: time }) })
    }
}

async function getRecommendedActivity(groupId: string) {
    const response = await fetch(`/api/getRecommendedActivity?groupId=${groupId}`)
    console.log(await response.json())
}

async function searchNearby(location: { coords: google.maps.LatLng }, choices: { restaurant: boolean, park: boolean, cafe: boolean }) {
    if (!Object.values(choices).find((item) => { return item == true })) {
        console.log("no choices selected")
        return;
    };

    const body = {
        choices: choices,
        lat: location.coords.lat(),
        lng: location.coords.lng(),
    }

    const response = await fetch(`/api-google/searchNearby`,
        {
            method: "POST",
            body: JSON.stringify(body)
        })

    const responseJson = await response.json()
    const places: Array<{ displayName: { text: string }, location: { latitude: number, longitude: number } }> = responseJson.places || [];
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
async function findRoute(location: { coords: google.maps.LatLng }, transportType: string, getSet: getSetType) {

    const arrivalTime = getSet.arrivalTime.value + ":00Z";
    const lat = getSet.lat.value;
    const lng = getSet.lng.value;
    if (!(lat && lng)) { return; }
    const body = {
        arrivalTime: arrivalTime,
        currentLat: location.coords.lat(),
        currentLng: location.coords.lng(),
        lat: lat,
        lng: lng,
        transportType: transportType
    }
    const routesResponse = await fetch(`/api-google/findRoute`,
        {
            method: "POST",
            body: JSON.stringify(body)
        })
    const responseJson = await routesResponse.json()
    const routes: routeInfo[] = []
    responseJson?.routes.forEach((route: any) => {
        const steps: any[] = []
        let pathData: any[] = [];
        try {
            pathData = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline)

        } catch (e) {
            console.log("Couldn't convert line", e)
        }
        route.legs.forEach((leg: any) => {
            leg.steps.forEach((step: any) => {
                steps.push({
                    mode: step.travelMode,
                    action: step?.navigationInstruction?.maneuver || "",
                    instructions: step?.navigationInstruction?.instructions || ""
                })
            })
        })
        const hoursAndMinutesDuration = new Date((+(route.duration.substring(0, route.duration.length - 1))) * 1000).toISOString().slice(11, 19);

        routes.push({ steps, pathData, travelMode: transportType, duration: hoursAndMinutesDuration })
    })
    getSet.routes.setValue(routes)
}

function createState<T>(initialValue: T): getSet<T> {
    const [value, setValue] = useState<T>(initialValue)

    return {
        value,
        setValue
    }
}