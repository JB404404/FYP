import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

export async function POST(req: NextRequest) {
    const reqBody = await req.json()

    const lat = reqBody.lat
    const lng = reqBody.lng
    const currentLat = reqBody.currentLat
    const currentLng = reqBody.currentLng
    const arrivalTime = reqBody.arrivalTime
    const transportType = reqBody.transportType

    const body = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": currentLat,
                    "longitude": currentLng
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": 51.27686,// (+lat) + (0.03),
                    "longitude": 0.18168//lng
                }
            }
        },
        "travelMode": transportType,
        "computeAlternativeRoutes": false,
        "arrivalTime": arrivalTime,
        "routeModifiers": {
            "avoidTolls": false,
            "avoidHighways": false,
            "avoidFerries": false
        },
        "languageCode": "en-US",
        "units": "METRIC"
    }

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,geocodingResults,routes.legs.steps'
        }
    })

    return NextResponse.json(await response.json())
}