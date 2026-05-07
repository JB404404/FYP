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

type getSetType = {
    email: string,
    setEmail: Dispatch<SetStateAction<string>>,
    lat: string | undefined,
    setLat: Dispatch<SetStateAction<string | undefined>>,
    lng: string | undefined,
    setLng: Dispatch<SetStateAction<string | undefined>>,
    path: google.maps.LatLngLiteral[],
    setPath: Dispatch<SetStateAction<google.maps.LatLngLiteral[]>>,
    routes: routeInfo[],
    setRoutes: Dispatch<SetStateAction<routeInfo[]>>,
    arrivalTime: string | undefined,
    setArrivalTime: Dispatch<SetStateAction<string | undefined>>,
    clickedLatLng: { lat: number, lng: number } | undefined,
    setClickedLatLng: Dispatch<SetStateAction<{ lat: number, lng: number } | undefined>>,
    activity: string,
    setActivity: Dispatch<SetStateAction<string>>
    suggestions: { activity: string, latLng: number[], user: string, ratings: any }[],
    setSuggestions: Dispatch<SetStateAction<{ activity: string, latLng: number[], user: string, ratings: any }[]>>,
    rating: number | undefined,
    setRating: Dispatch<SetStateAction<number | undefined>>,
    timeFrames: string[],
    setTimeFrames: Dispatch<SetStateAction<string[]>>,
    availability: number | undefined,
    setAvailability: Dispatch<SetStateAction<number | undefined>>,
    firstLoad: boolean,
    setFirstLoad: Dispatch<SetStateAction<boolean>>
}

export default function ClientMap({ searchParams }: { searchParams: any }) {

    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const [routes, setRoutes] = useState<routeInfo[]>([]);
    const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);
    const [targetEmail, setTargetEmail] = useState("");

    const [lat, setLat] = useState(searchParams?.lat);
    const [lng, setLng] = useState(searchParams?.lng);
    const [clickedLatLng, setClickedLatLng] = useState(undefined as { lat: number, lng: number } | undefined);

    const [arrivalTime, setArrivalTime] = useState(searchParams?.arrivalTime);
    const [activity, setActivity] = useState("");

    const [suggestions, setSuggestions] = useState<{ activity: string, latLng: number[], user: string, ratings: any }[]>([]);
    const [rating, setRating] = useState<number | undefined>(undefined);

    const [timeFrames, setTimeFrames] = useState<string[]>([]);
    const [availability, setAvailability] = useState<number | undefined>(undefined);

    const groupId = searchParams?.id;

    const { isLoaded: isMapAPILoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY || '',
        libraries: ['maps', 'marker', 'geometry']
    })

    if (!isMapAPILoaded) {
        return <span>Loading</span>
    } else {
        const destinationLatLng = new google.maps.LatLng({
            lat: +(searchParams?.lat || 51.509865),
            lng: +(searchParams?.lng || -0.118092)
        })
        return Map(destinationLatLng, groupId, { email: targetEmail, setEmail: setTargetEmail, lat: lat, setLat, lng: lng, setLng, path: path, setPath, routes, setRoutes, arrivalTime, setArrivalTime, clickedLatLng, setClickedLatLng, activity, setActivity, suggestions, setSuggestions, rating, setRating, timeFrames, setTimeFrames, availability, setAvailability, firstLoad, setFirstLoad });
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

    const ratingOptions: [string, number][] = [["Sounds great", 3], ["Okay with me", 2], ["Would prefer not to, but will with friends", 1], ["Not happening", 0]];
    const availabilityOptions: [string, number][] = [["Available", 1], ["Will need to arrive a bit later", 0.7], ["Can't make it", 0]];

    let transportType = "TRANSIT";

    return <GoogleMap onLoad={(newMap) => { map = newMap; if (getSet.firstLoad) { map.panTo(location.coords) }; getSet.setFirstLoad(false); console }} id={"1"} zoom={10} mapContainerClassName='google-map-container'
        onClick={(e) => {
            if (e.latLng) {
                getSet.setClickedLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }

        }}>
        <Marker position={location.coords}></Marker>
        {getSet.clickedLatLng && <Marker position={getSet.clickedLatLng} />}

        <Polyline path={getSet.path} options={{ strokeColor: "#4285F4", strokeWeight: 4, }} />
        <span className='map-options'>
            <button onClick={async () => { redirect("/") }} className="map-button-toggle-on">Back to menu</button>
        </span>
        <span className='map-options'>
            <input className="button"
                type="text"
                value={getSet.email}
                onChange={(e) => getSet.setEmail(e.target.value)}
                placeholder="Enter email..."
            />
            <button onClick={async () => { addUserToGroup(getSet.email, groupId) }} className="button">Add to group</button>
            <button onClick={async () => { removeUserFromGroup(getSet.email, groupId) }} className="button">Remove user from group</button>
            <button onClick={async () => { setGroupDestination(groupId, getSet.clickedLatLng) }} className="button">Set a group's destination</button>
            <input type="datetime-local" value={getSet.arrivalTime} onChange={(e) => getSet.setArrivalTime(e.target.value)} />
            <button onClick={async () => { setGroupArrivalTime(groupId, getSet.arrivalTime) }} className="button">Set group's arrival time</button>
            <button onClick={async () => { suggestGroupArrivalTime(groupId, getSet.arrivalTime) }} className="button">Suggest group's arrival time</button>
        </span>
        <span className='map-options'>
            <input className="button"
                type="text"
                value={getSet.activity}
                onChange={(e) => getSet.setActivity(e.target.value)}
                placeholder="Enter activity..."
            />
            <button onClick={async () => { suggestLocationAndActivity(groupId, getSet.clickedLatLng, getSet.activity) }} className="button">Suggest location and activity</button>
        </span>

        <span className='map-options'>
            <button onClick={async () => { getTimeFrames(groupId, getSet) }} className="button">Get timeframes</button>
            {availabilityOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={() => getSet.setAvailability(option[1])}
                    style={{
                        display: "block",
                        margin: "8px 0",
                        backgroundColor: getSet.availability === (option[1]) ? "lightblue" : "black",
                    }}
                >
                    {option[0]}
                </button>
            ))}
            {getSet.timeFrames.map((item, index: number) => (
                <span key={index}>
                    <button className="button" onClick={() => { setAvailability(groupId, getSet.availability, item) }}>{`Set availability - ${item}`}</button>
                </span>
            ))}
        </span>

        <span className='map-options'>
            <button onClick={async () => { getSuggestions(groupId, getSet) }} className="button">Get suggestions</button>
            {ratingOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={() => getSet.setRating(option[1])}
                    style={{
                        display: "block",
                        margin: "8px 0",
                        backgroundColor: getSet.rating === (option[1]) ? "lightblue" : "black",
                    }}
                >
                    {option[0]}
                </button>
            ))}
            {getSet.suggestions.map((item, index: number) => (
                <span key={index}>
                    <button className="button" onClick={() => { setRating(groupId, getSet.rating, item) }}>{`Set rating - ${item.activity}`}</button>
                </span>
            ))}

            <button className="button" onClick={() => { getRecommendedActivity(groupId) }}>Get recommended activity</button>
        </span>

        <span className='map-options'>
            <button onClick={async () => { choices.restaurant = !choices.restaurant }} className="map-button-toggle-on">Restaurants</button>
            <button onClick={async () => { choices.park = !choices.park }} className="map-button-toggle-on">Parks</button>
            <button onClick={async () => { choices.cafe = !choices.cafe }} className="map-button-toggle-on">Cafe</button>

            <button onClick={async () => { searchNearby(location, choices) }} className="map-button">Search nearby</button>
        </span>
        <span className='map-options'>
            <button onClick={async () => { transportType = "TRANSIT" }} className="map-button-toggle-on">Public transport</button>
            <button onClick={async () => { transportType = "DRIVE" }} className="map-button-toggle-on">Car</button>
            <button onClick={async () => { transportType = "WALK" }} className="map-button-toggle-on">Walk</button>
            <button onClick={async () => { findRoute(location, transportType, getSet) }} className="map-button">Find route</button>
        </span>
        <span className='map-options'>
            {getSet.routes.map((item: routeInfo, index: number) => (
                <span key={index}>
                    <button className="button" onClick={() => { getSet.setPath(item.pathData) }}>{`${item.duration} - ${item.travelMode}`}</button>
                </span>
            ))}
        </span>
    </GoogleMap>
}

function addUserToGroup(targetEmail: string, groupId: string) {
    fetch(`/api/addUserToGroup`,
        { method: "POST", body: JSON.stringify({ groupId: groupId, email: targetEmail }) }
    )
}
function removeUserFromGroup(targetEmail: string, groupId: string) {
    fetch(`/api/removeUserFromGroup`,
        { method: "POST", body: JSON.stringify({ groupId: groupId, email: targetEmail }) })
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

async function getSuggestions(groupId: string, getSet: getSetType) {
    const response = await fetch(`/api/getSuggestions?groupId=${groupId}`)
    const responseJson = await response.json()
    const updatedSuggestions = [];
    for (let index in responseJson.suggestions) {
        const userSuggestions = responseJson.suggestions[index]
        for (let sIndex in userSuggestions) {
            const suggestion = userSuggestions[sIndex]
            suggestion.user = index;
            suggestion.activity = sIndex;
            updatedSuggestions.push(suggestion)
        }
    }
    getSet.setSuggestions(updatedSuggestions)
}

async function getTimeFrames(groupId: string, getSet: getSetType) {
    const response = await fetch(`/api/getTimeFrames?groupId=${groupId}`)
    const responseJson = await response.json()
    const updatedTimeFrames = [];
    for (let index in responseJson.timeFrames) {
        updatedTimeFrames.push(index)
    }
    getSet.setTimeFrames(updatedTimeFrames)
}

function setAvailability(groupId: string, availability: number | undefined, dateTime: string) {
    if (availability != undefined) {
        fetch(`/api/setAvailability`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, availability: availability, dateTime: dateTime }) })
    }
}

function setRating(groupId: string, rating: number | undefined, suggestion: { activity: string, latLng: number[], user: string, ratings: any }) {
    if (rating != undefined) {
        fetch(`/api/setRating`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, rating: rating, activity: suggestion.activity, user: suggestion.user }) })
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
async function findRoute(location: { coords: google.maps.LatLng }, transportType: string, getSet: getSetType) {

    const arrivalTime = getSet.arrivalTime + ":00Z";
    const lat = getSet.lat;
    const lng = getSet.lng;
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
                    action: step.navigationInstruction.maneuver,
                    instructions: step.navigationInstruction.instructions
                })
            })
        })
        routes.push({ steps, pathData, travelMode: transportType, duration: route.duration })
    })
    getSet.setRoutes(routes)
}
