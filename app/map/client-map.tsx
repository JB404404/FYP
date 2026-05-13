'use client'
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { redirect } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { stateType } from './getSet';

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
    path: getSet<google.maps.LatLngLiteral[]>,
    routes: getSet<routeInfo[]>,
    suggestArrivalTime: getSet<string | undefined>,
    clickedLatLng: getSet<google.maps.LatLng | undefined>,
    activity: getSet<string>,
    firstLoadMap: getSet<boolean>,
    findingRoute: getSet<boolean>
}

export default function ClientMap({ stateObject }: {
    stateObject: stateType
}) {

    const [location, setLocation] = useState<google.maps.LatLng | undefined>(undefined)
    useEffect(() => {
        const geolocation = navigator.geolocation;
        if (!geolocation) { return; }


        const locationSubscription = geolocation?.watchPosition(
            (position) => {
                setLocation(new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude }))
            },
            (err) => {
                if (err.code != 1) {
                    console.error(err)
                };
                setLocation(undefined)
            }
        )

        return () => { navigator.geolocation.clearWatch(locationSubscription) }
    })

    // defines the state object for the map page
    const mapStateObject: getSetType = {
        firstLoadMap: createState<boolean>(true),
        routes: createState<routeInfo[]>([]),
        path: createState<google.maps.LatLngLiteral[]>([]),
        email: createState<string>(""),
        clickedLatLng: createState<google.maps.LatLng | undefined>(undefined),
        suggestArrivalTime: createState<string | undefined>(""),
        activity: createState<string>(""),
        findingRoute: createState<boolean>(false)
    }

    const { isLoaded: isMapAPILoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY || '',
        libraries: ['maps', 'marker', 'geometry']
    })

    if (!isMapAPILoaded) {
        return <div>Loading</div>
    } else {
        return Map(location, mapStateObject, stateObject);
    }
}

function Map(location: google.maps.LatLng | undefined, getSet: getSetType, stateObject: stateType) {

    const choices = {
        restaurant: false,
        park: false,
        cafe: false
    };

    const onLoadFunction = (newMap: any) => {
        map = newMap;
        if ((getSet.firstLoadMap.value)) {
            if (stateObject.destinationLatLng.value) {
                map.panTo(new google.maps.LatLng(+stateObject.destinationLatLng.value[0], +stateObject.destinationLatLng.value[1]))
            } else {
                map.panTo(new google.maps.LatLng(51.509865, -0.118092))
            }
        }
        getSet.firstLoadMap.setValue(false);
    };

    return <GoogleMap onLoad={onLoadFunction} id={"1"} zoom={10} mapContainerClassName='google-map-container'
        onClick={(e) => {
            if (e.latLng) {
                getSet.clickedLatLng.setValue(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()))
            }
        }}
        onDragStart={() => {
            getSet.clickedLatLng.setValue(undefined)
        }}>
        {(location != undefined) && <Marker position={location}></Marker>}
        {(stateObject.destinationLatLng.value != undefined) && <Marker position={new google.maps.LatLng(+stateObject.destinationLatLng.value[0], +stateObject.destinationLatLng.value[1])}></Marker>}
        {getSet.clickedLatLng.value && <Marker position={getSet.clickedLatLng.value} />}

        <Polyline path={getSet.path.value} options={{ strokeColor: "#4285F4", strokeWeight: 4, }} />
        <div className='map-options'>
            {(getSet.clickedLatLng.value && (!getSet.findingRoute.value)) && <div className='map-options'>
                <input className='map-button'
                    type="text"
                    value={getSet.activity.value}
                    onChange={(e) => getSet.activity.setValue(e.target.value)}
                    placeholder="Enter activity..."
                />
                <button onClick={async () => { suggestLocationAndActivity(stateObject.id, getSet.clickedLatLng.value, getSet.activity.value) }} className='map-button'>Suggest activity</button>
            </div>}
            {(getSet.clickedLatLng.value && stateObject.ownerAccount.value && (!getSet.findingRoute.value)) && <div className='map-options'><button onClick={async () => { setGroupDestination(stateObject.id, getSet.clickedLatLng.value, getSet.activity.value) }} className='map-button'>Set destination</button></div>}
            {/* <div className='map-options'>
            <button onClick={async () => { choices.restaurant = !choices.restaurant }} className='map-button'>Restaurants</button>
            <button onClick={async () => { choices.park = !choices.park }} className='map-button'>Parks</button>
            <button onClick={async () => { choices.cafe = !choices.cafe }} className='map-button'>Cafe</button>

            <button onClick={async () => { searchNearby(location, choices) }} className='map-button'>Search nearby</button>
        </div> */}
            <div className='map-options'>
                {(!getSet.findingRoute.value) && <button disabled={!(!!stateObject.destinationLatLng.value && !!stateObject.arrivalTime.value)} onClick={async () => { getSet.findingRoute.setValue(true) }} className='map-button'>Find route</button>}
                {getSet.findingRoute.value && <button onClick={async () => { getSet.findingRoute.setValue(false) }} className='map-button'>Cancel</button>}

                {(getSet.findingRoute.value && (location != undefined)) && <div className='map-options'>
                    <button onClick={async () => { findRoute(location, "TRANSIT", getSet, stateObject); getSet.findingRoute.setValue(false) }} className='map-button'>Public transport</button>
                    <button onClick={async () => { findRoute(location, "DRIVE", getSet, stateObject); getSet.findingRoute.setValue(false) }} className='map-button'>Car</button>
                    <button onClick={async () => { findRoute(location, "WALK", getSet, stateObject); getSet.findingRoute.setValue(false) }} className='map-button'>Walk</button>
                </div>}
                {(getSet.findingRoute.value && (location == undefined)) && <div className='map-options'>
                    <div className='map-info'>Select a starting location</div>
                    <button disabled={!getSet.clickedLatLng.value} onClick={async () => { await findRoute(getSet.clickedLatLng.value, "TRANSIT", getSet, stateObject); getSet.findingRoute.setValue(false); getSet.clickedLatLng.setValue(undefined) }} className='map-button'>Public transport</button>
                    <button disabled={!getSet.clickedLatLng.value} onClick={async () => { await findRoute(getSet.clickedLatLng.value, "DRIVE", getSet, stateObject); getSet.findingRoute.setValue(false); getSet.clickedLatLng.setValue(undefined) }} className='map-button'>Car</button>
                    <button disabled={!getSet.clickedLatLng.value} onClick={async () => { await findRoute(getSet.clickedLatLng.value, "WALK", getSet, stateObject); getSet.findingRoute.setValue(false); getSet.clickedLatLng.setValue(undefined) }} className='map-button'>Walk</button>
                </div>}
            </div>
            {(!getSet.findingRoute.value) && <div className='map-options'>
                {getSet.routes.value.map((item: routeInfo, index: number) => (
                    <div key={index}>
                        <button className='map-button' onClick={() => { getSet.path.setValue(item.pathData) }}>{`${item.travelMode} ${item.duration}`}</button>
                    </div>
                ))}
            </div>}
        </div>
    </GoogleMap>
}

function setGroupDestination(groupId: string, latLng: undefined | google.maps.LatLng, activity: string) {
    if (latLng && (activity != "")) {
        fetch(`/api/setGroupDestinationAndActivity`, { method: "POST", body: JSON.stringify({ groupId: groupId, lat: latLng.lat(), lng: latLng.lng(), activity: activity }) })
    }
}
function suggestLocationAndActivity(groupId: string, latLng: undefined | google.maps.LatLng, activity: string) {
    if (latLng && (activity != "")) {
        fetch(`/api/suggestLocationAndActivity`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, lat: latLng.lat(), lng: latLng.lng(), activity: activity }) })
    }
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
async function findRoute(location: google.maps.LatLng | undefined, transportType: string, getSet: getSetType, stateObject: stateType) {
    if (location == undefined || stateObject.arrivalTime.value == undefined || stateObject.destinationLatLng.value == undefined) { return; }
    const arrivalTime = stateObject.arrivalTime.value + ":00Z";
    const lat = stateObject.destinationLatLng.value?.[0];
    const lng = stateObject.destinationLatLng.value?.[1];
    if (!(lat && lng)) { return; }
    const body = {
        arrivalTime: arrivalTime,
        currentLat: location.lat(),
        currentLng: location.lng(),
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
    responseJson?.routes?.forEach((route: any) => {
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