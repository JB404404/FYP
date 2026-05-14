'use client'
import { GoogleMap, Libraries, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { createState, getSet, stateType } from './getSet';

let map: any = null;
const searchMarkers: Array<google.maps.Marker> = [];

const API_KEY = process.env.NEXT_PUBLIC_EMBEDDED_MAP_API_KEY || '';
const googleMapsLibraries: Libraries = ['maps', 'marker', 'geometry'];

type routeInfo = {
    steps: any[],
    pathData: any[],
    travelMode: string,
    duration: string
}

type mapStateObject = {
    email: getSet<string>,
    path: getSet<google.maps.LatLngLiteral[]>,
    routes: getSet<routeInfo[]>,
    suggestArrivalTime: getSet<string | undefined>,
    clickedLatLng: getSet<google.maps.LatLng | undefined>,
    activity: getSet<string>,
    firstLoadMap: getSet<boolean>,
    findingRoute: getSet<boolean>,
    hasLocationPermission: getSet<boolean>
}

export default function ClientMap({ stateObject }: {
    stateObject: stateType
}) {

    // defines the state object for the map page
    const mapStateObject: mapStateObject = {
        firstLoadMap: createState<boolean>(true),
        routes: createState<routeInfo[]>([]),
        path: createState<google.maps.LatLngLiteral[]>([]),
        email: createState<string>(""),
        clickedLatLng: createState<google.maps.LatLng | undefined>(undefined),
        suggestArrivalTime: createState<string | undefined>(""),
        activity: createState<string>(""),
        findingRoute: createState<boolean>(false),
        hasLocationPermission: createState<boolean>(true)
    }

    const { isLoaded: isMapAPILoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY || '',
        libraries: googleMapsLibraries
    })

    if (!isMapAPILoaded) {
        return <div>Loading</div>
    } else {
        return Map(mapStateObject, stateObject);
    }
}

function Map(mapState: mapStateObject, stateObject: stateType) {


    const onLoadFunction = (newMap: any) => {
        map = newMap;
        if ((mapState.firstLoadMap.value)) {
            if (stateObject.destinationLatLng.value) {
                map.panTo(new google.maps.LatLng(+stateObject.destinationLatLng.value[0], +stateObject.destinationLatLng.value[1]))
            } else {
                map.panTo(new google.maps.LatLng(51.509865, -0.118092))
            }
        }
        mapState.firstLoadMap.setValue(false);
    };

    return <GoogleMap onLoad={onLoadFunction} id={"1"} zoom={10} mapContainerClassName='google-map-container'
        onClick={(e) => {
            if (e.latLng) {
                mapState.clickedLatLng.setValue(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()))
            }
        }}
        onDragStart={() => {
            mapState.clickedLatLng.setValue(undefined)
        }}>

        {(stateObject.destinationLatLng.value != undefined) && <Marker position={new google.maps.LatLng(+stateObject.destinationLatLng.value[0], +stateObject.destinationLatLng.value[1])}></Marker>}
        {mapState.clickedLatLng.value && <Marker position={mapState.clickedLatLng.value} />}

        <Polyline path={mapState.path.value} options={{ strokeColor: "#4285F4", strokeWeight: 4, }} />
        <div className='map-options'>
            {(mapState.clickedLatLng.value && (!mapState.findingRoute.value)) && <div className='map-options'>
                <input className='map-button'
                    type="text"
                    value={mapState.activity.value}
                    onChange={(e) => mapState.activity.setValue(e.target.value)}
                    placeholder="Enter activity..."
                />
                <button onClick={async () => { suggestLocationAndActivity(stateObject.id, mapState.clickedLatLng.value, mapState.activity.value) }} className='map-button'>Suggest activity</button>
            </div>}
            {(mapState.clickedLatLng.value && stateObject.ownerAccount.value && (!mapState.findingRoute.value)) && <div className='map-options'><button onClick={async () => { setGroupDestination(stateObject.id, mapState.clickedLatLng.value, mapState.activity.value) }} className='map-button'>Set destination</button></div>}
            {/* <div className='map-options'>
            <button onClick={async () => { choices.restaurant = !choices.restaurant }} className='map-button'>Restaurants</button>
            <button onClick={async () => { choices.park = !choices.park }} className='map-button'>Parks</button>
            <button onClick={async () => { choices.cafe = !choices.cafe }} className='map-button'>Cafe</button>

            <button onClick={async () => { searchNearby(location, choices) }} className='map-button'>Search nearby</button>
        </div> */}
            <div className='map-options'>
                {(!mapState.findingRoute.value) && <button disabled={!(!!stateObject.destinationLatLng.value && !!stateObject.arrivalTime.value)} onClick={async () => { mapState.findingRoute.setValue(true) }} className='map-button'>Find route</button>}
                {mapState.findingRoute.value && <button onClick={async () => { mapState.findingRoute.setValue(false) }} className='map-button'>Cancel</button>}

                {(mapState.findingRoute.value && (mapState.hasLocationPermission.value == true)) && <div className='map-options'>
                    <button onClick={async () => { if (await findRoute(await getUserLocation(mapState.hasLocationPermission), "TRANSIT", mapState, stateObject)) { mapState.findingRoute.setValue(false) } }} className='map-button'>Public transport</button>
                    <button onClick={async () => { if (await findRoute(await getUserLocation(mapState.hasLocationPermission), "DRIVE", mapState, stateObject)) { mapState.findingRoute.setValue(false) } }} className='map-button'>Car</button>
                    <button onClick={async () => { if (await findRoute(await getUserLocation(mapState.hasLocationPermission), "WALK", mapState, stateObject)) { mapState.findingRoute.setValue(false) } }} className='map-button'>Walk</button>
                </div>}
                {(mapState.findingRoute.value && (mapState.hasLocationPermission.value == false)) && <div className='map-options'>
                    <div className='map-info'>Select a starting location</div>
                    <button disabled={!mapState.clickedLatLng.value} onClick={async () => { await findRoute(mapState.clickedLatLng.value, "TRANSIT", mapState, stateObject); mapState.findingRoute.setValue(false); mapState.clickedLatLng.setValue(undefined) }} className='map-button'>Public transport</button>
                    <button disabled={!mapState.clickedLatLng.value} onClick={async () => { await findRoute(mapState.clickedLatLng.value, "DRIVE", mapState, stateObject); mapState.findingRoute.setValue(false); mapState.clickedLatLng.setValue(undefined) }} className='map-button'>Car</button>
                    <button disabled={!mapState.clickedLatLng.value} onClick={async () => { await findRoute(mapState.clickedLatLng.value, "WALK", mapState, stateObject); mapState.findingRoute.setValue(false); mapState.clickedLatLng.setValue(undefined) }} className='map-button'>Walk</button>
                </div>}
            </div>
            {(!mapState.findingRoute.value) && <div className='map-options'>
                {mapState.routes.value.map((item: routeInfo, index: number) => (
                    <div key={index}>
                        <button className='map-button' onClick={() => { mapState.path.setValue(item.pathData) }}>{`${item.travelMode} ${item.duration}`}</button>
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

async function getUserLocation(hasLocationPermission: getSet<boolean>): Promise<google.maps.LatLng | undefined> {
    return navigator.permissions?.query({ name: "geolocation" }).then(async (hasPermission) => {
        const geolocation = navigator.geolocation;
        if (!geolocation) { return; }
        if (hasPermission.state == "prompt" || hasPermission.state == "granted") {
            const position = await new Promise<GeolocationPosition | undefined>(
                (res, rej) => {
                    geolocation.getCurrentPosition(res, () => (res(undefined)));
                }
            );
            if (position) {
                return new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            } else {
                console.log("Error accessing user location");
                hasLocationPermission.setValue(false)
                return position
            }

        } else {
            console.log("User location permission denied")
            hasLocationPermission.setValue(false)
            return undefined
        }
    })
}

async function findRoute(location: google.maps.LatLng | undefined, transportType: string, getSet: mapStateObject, stateObject: stateType) {
    if (
        location == undefined ||
        stateObject.arrivalTime.value == undefined ||
        stateObject.destinationLatLng?.value?.[0] == undefined ||
        stateObject.destinationLatLng?.value?.[1] == undefined
    ) { return false; }
    const arrivalTime = stateObject.arrivalTime.value + ":00Z";
    const lat = stateObject.destinationLatLng.value?.[0];
    const lng = stateObject.destinationLatLng.value?.[1];

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
    return true
}