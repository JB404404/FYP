'use client'
import { useState } from "react";
import { stateType } from "./getSet";

export default function RatingPage({ stateObject }: {
    stateObject: stateType
}) {

    const [suggestions, setSuggestions] = useState<{ activity: string, latLng: number[], index: string }[]>([])
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectedSuggestion, setSelectedSuggestion] = useState<{ activity: string, latLng: number[], index: string } | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)

    const ratingOptions: [string, number][] = [["Sounds great", 3], ["Okay with me", 2], ["Not preferable", 1], ["Not happening", 0]];

    const groupId = stateObject.id;

    const getSuggestions = async () => {
        setLoading(true)
        setSuggestions([])
        const response = await fetch(`/api/getSuggestions?groupId=${groupId}`)
        const responseJson = await response.json()
        const updatedSuggestions = [];
        for (let suggestion of responseJson.suggestions) {
            updatedSuggestions.push({ activity: suggestion.activity, index: suggestion.index, latLng: suggestion.latLng })
        }
        setSuggestions(updatedSuggestions)
        setLoading(false)
    }

    if (firstLoad) {
        setFirstLoad(false);
        getSuggestions();
    }

    const setRating = async (rating: number) => {
        if (selectedSuggestion != undefined) {
            setLoading(true)
            await fetch(`/api/setRating`, { method: "POST", body: JSON.stringify({ rating: rating, activity: selectedSuggestion.activity, index: selectedSuggestion.index }) })
            setSelectedSuggestion(undefined)
            setLoading(false)
        }
    }

    return <div className='sub-page'>
        {(!selectedSuggestion) && <div className='sub-page-button-container'>
            <button onClick={async () => { getSuggestions() }} disabled={loading} className='button'>Reload suggestions</button>
            <div>Rate activities:</div>
            {loading && <div>Loading...</div>}
            {suggestions.map((item, index: number) => (
                <button className='button' key={index} onClick={() => { setSelectedSuggestion(item) }}>{item.activity}</button>
            ))}
        </div>}
        {selectedSuggestion && <div className='sub-page-button-container'>
            <button className='button' onClick={() => { setSelectedSuggestion(undefined) }}>Choose different activity</button>
            {ratingOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={() => setRating(option[1])}
                    className='value-input-button'
                    disabled={loading}
                >
                    {option[0]}
                </button>
            ))}
        </div>}
    </div>
}