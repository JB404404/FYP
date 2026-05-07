import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

export async function POST(req: NextRequest) {

    const reqBody = await req.json()

    const lat = reqBody.lat
    const lng = reqBody.lng
    const choices = reqBody.choices

    const body = {
        'includedTypes': [...choices.restaurant ? ['restaurant'] : [], ...choices.park ? ['park'] : [], ...choices.cafe ? ['cafe'] : []],
        'maxResultCount': 10,
        'locationRestriction': {
            'circle': {
                'center': {
                    'latitude': lat,
                    'longitude': lng
                },
                'radius': 500.0
            }
        }
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.location'
        }
    })

    return NextResponse.json({ places: (await response.json()).places })
}