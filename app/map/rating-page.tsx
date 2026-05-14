'use client'
import { useState } from "react";
import { stateType } from "./getSet";
import { toast } from "sonner";

export default function RatingPage({ stateObject }: {
    stateObject: stateType
}) {

    const [suggestions, setSuggestions] = useState<{ activity: string, latLng: [number, number], index: string, averageRating: number, userRating: string, placeName: string | undefined }[]>([])
    const [viewingRating, setViewingRating] = useState<boolean>(false)
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectedSuggestion, setSelectedSuggestion] = useState<{ activity: string, latLng: number[], index: string, averageRating: number, userRating: string } | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)

    const ratingConversion: Map<number, string> = new Map([[3, "Sounds great"], [2, "Okay with me",], [1, "Not preferable"], [0, "Not happening"]]);
    const ratingOptions: [string, number][] = [["Sounds great", 3], ["Okay with me", 2], ["Not preferable", 1], ["Not happening", 0]];

    const groupId = stateObject.id;

    const getSuggestions = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/getSuggestions?groupId=${groupId}`)
            if (!response.ok) { throw new Error() }
            const responseJson = await response.json()
            const updatedSuggestions = [];
            for (let suggestion of responseJson.suggestions) {
                updatedSuggestions.push({ activity: suggestion.activity, index: suggestion.index, latLng: suggestion.latLng, placeName: suggestion.placeName, averageRating: suggestion.averageRating || 0, userRating: ratingConversion.get(suggestion.userRating) || ratingConversion.get(0)!! })
            }
            setSuggestions(updatedSuggestions)
        } catch {
            toast.error("An error occurred while getting activity suggestions")
        } finally {
            setLoading(false)
        }

    }

    if (firstLoad) {
        setFirstLoad(false);
        getSuggestions();
    }

    const setRating = async (rating: number) => {
        if (selectedSuggestion != undefined) {
            setLoading(true)
            try {
                const response = await fetch(`/api/setRating`, { method: "POST", body: JSON.stringify({ rating: rating, activity: selectedSuggestion.activity, index: selectedSuggestion.index }) })
                if (!response.ok) { throw new Error() }
                toast.success("Activity rating set successfully")
                setSelectedSuggestion(undefined)
                await getSuggestions()
            } catch {
                toast.error("An error occured whilst setting activity rating")
            } finally {
                setLoading(false)
            }
        }
    }

    return <div className='sub-page'>
        {(!selectedSuggestion) && <div className='sub-page-button-container'>
            {stateObject.ownerAccount.value && <div className='recommendations'>
                {!viewingRating && <button onClick={async () => { setViewingRating(true) }} className='button'>View current ratings</button>}
                {viewingRating && <button onClick={async () => { setViewingRating(false) }} className='button'>Hide</button>}
                {viewingRating && suggestions.sort((a, b) => { return b.averageRating - a.averageRating }).map((item, index: number) => (
                    <div key={index} className='recommendation-list-item'>
                        <div className='text-container'>{item.activity}</div>
                        <div className='text-container'>Rating: {item.averageRating.toString().substring(0, 5)} / 3</div>
                        <button className="select-button" disabled={loading} onClick={async () => { setLoading(true); await setGroupDestination(groupId, item.latLng, item.activity); stateObject.updateGroupState?.(); setViewingRating(false); setLoading(false) }}>Select</button>
                    </div>
                ))}
                <hr className="page-split" />
            </div>}
            <button onClick={async () => { getSuggestions() }} disabled={loading} className='button'>Reload suggestions</button>
            <div>Rate activities:</div>
            {loading && <div>Loading...</div>}
            {suggestions.map((item, index: number) => (
                <button className='button' key={index} onClick={() => { setSelectedSuggestion(item) }}><div>{item.activity}</div>{item.placeName && <div>at {item.placeName}</div>}<div>{item.userRating}</div></button>
            ))}
        </div>}
        {selectedSuggestion && <div className='sub-page-button-container'>
            <button className='button' disabled={loading} onClick={() => { setSelectedSuggestion(undefined) }}>Choose different activity</button>
            {ratingOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={async () => { await setRating(option[1]); }}
                    className='value-input-button'
                    disabled={loading}
                >
                    {option[0]}
                </button>
            ))}
        </div>}
    </div>
}

async function setGroupDestination(groupId: string, latLng: [number, number], activity: string) {
    if (latLng && (activity != "")) {
        try {
            const response = await fetch(`/api/setGroupDestinationAndActivity`, { method: "POST", body: JSON.stringify({ groupId: groupId, lat: latLng[0], lng: latLng[1], activity: activity }) })
            if (!response.ok) { throw new Error() }
            toast.success("Activity and destination set successfully")
        } catch {
            toast.error("An error occured while setting activity and destination")
        }
    }

}