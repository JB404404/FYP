'use client'
import { useState } from "react";
import { stateType } from "./getSet";
import { toast } from "sonner";

export default function AvailabilityPage({ stateObject }: {
    stateObject: stateType
}) {

    const [timeFrames, setTimeFrames] = useState<{ time: string, averageRating: number, userRating: string }[]>([])
    const [settingArrivalTime, setSettingArrivalTime] = useState<boolean>(false)
    const [arrivalTime, setArrivalTime] = useState<string>("")
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<{ time: string, averageRating: number, userRating: string } | undefined>(undefined)
    const [viewingRating, setViewingRating] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const availabilityConversion: Map<number, string> = new Map([[1, "Available"], [0.7, "Will arrive a bit late"], [0, "Can't make it"]]);
    const availabilityOptions: [string, number][] = [["Available", 1], ["Will arrive a bit late", 0.7], ["Can't make it", 0]];

    const groupId = stateObject?.id;

    const getTimeFrames = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/getTimeFrames?groupId=${groupId}`)
            if (!response.ok) { throw new Error() }

            const responseJson = await response.json()
            const newTimeframes = (responseJson.timeFrames) as { time: string, averageRating: number, userRating: number }[];
            newTimeframes.forEach((item) => {
                item.userRating = availabilityConversion.get(item.userRating) as any;
            })
            setTimeFrames(responseJson.timeFrames)
        } catch {
            toast.error("An error occurred while loading time frames")
        } finally {
            setLoading(false)
        }
    }

    const setAvailability = async (availability: number | undefined) => {
        if (availability != undefined) {
            setLoading(true)
            try {
                const response = await fetch(`/api/setAvailability`, { method: "POST", body: JSON.stringify({ groupId: groupId, availability: availability, dateTime: selectedTimeFrame?.time }) })
                if (!response.ok) { throw new Error() }
                toast.success("Availability set successfully")
                setSelectedTimeFrame(undefined)
                await getTimeFrames
            } catch {
                toast.error("An error occured whilst setting availability")
            } finally {
                setLoading(false)
            }
        }
    }


    if (firstLoad) {
        setFirstLoad(false);
        getTimeFrames();
    }

    return <div className='sub-page'>


        {(!selectedTimeFrame && !settingArrivalTime) && <div className='sub-page-button-container'>

            {stateObject.ownerAccount.value && <div className='recommendations'>
                {!viewingRating && <button onClick={async () => { setViewingRating(true) }} className='button'>View current ratings</button>}
                {viewingRating && <button onClick={async () => { setViewingRating(false) }} className='button'>Hide</button>}
                {viewingRating && timeFrames.sort((a, b) => { return b.averageRating - a.averageRating }).map((item, index: number) => (
                    <div key={index} className='recommendation-list-item'>
                        <div className='text-container'>{(new Date(item.time)).toLocaleString()}</div>
                        <div className='text-container'>Rating: {item.averageRating.toString().substring(0, 5)} / 1</div>
                        <button className="select-button" disabled={loading} onClick={async () => { setLoading(true); await setGroupArrivalTime(groupId, item.time); await stateObject.updateGroupState?.(); setViewingRating(false); setLoading(false) }}>Select</button>
                    </div>
                ))}
                <hr className="page-split" />
            </div>}

            <input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
            <button onClick={async () => { setSettingArrivalTime(true) }} className='button'>Set group's arrival time</button>
            <button onClick={async () => { suggestGroupArrivalTime(groupId, arrivalTime) }} className='button'>Suggest arrival time</button>
            <hr className="page-split" />
            <button onClick={async () => { getTimeFrames() }} disabled={loading} className='button'>Reload time frames</button>
            <div>Set availability for:</div>
            {loading && <div>Loading...</div>}
            {timeFrames.map((item, index: number) => (

                <button className='button' key={index} onClick={() => { setSelectedTimeFrame(item) }}><div>{(new Date(item.time)).toLocaleString()}</div><div>{item.userRating}</div></button>

            ))}
        </div>}
        {settingArrivalTime && <div className='sub-page-button-container'><button onClick={async () => { setSettingArrivalTime(false) }} className='button'>Cancel</button></div>}
        {settingArrivalTime && <div className='sub-page-button-container'>
            {timeFrames.map((item, index: number) => (

                <button className='value-input-button' key={index} onClick={async () => { await setGroupArrivalTime(groupId, item.time); setSettingArrivalTime(false) }}>{(new Date(item.time)).toLocaleString()}</button>

            ))}</div>}

        {selectedTimeFrame && <div className='sub-page-button-container'>
            <button className='button' disabled={loading} onClick={() => { setSelectedTimeFrame(undefined) }}>Choose different time frame</button>
            {availabilityOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={() => setAvailability(option[1])}
                    className='value-input-button'
                    disabled={loading}
                >
                    {option[0]}
                </button>
            ))}</div>}
    </div>
}

async function setGroupArrivalTime(groupId: string, time: string | undefined) {
    if (time) {
        try {
            const response = await fetch(`/api/setGroupArrivalTime`, { method: "POST", body: JSON.stringify({ groupId: groupId, arrivalTime: time }) })
            if (!response.ok) { throw new Error() }
            toast.success("Arrival time set successfully")
        } catch {
            toast.error("An error occured while setting arrival time")
        }
    }
}

async function suggestGroupArrivalTime(groupId: string, time: string | undefined) {
    if (time) {
        try {
            const response = await fetch(`/api/suggestGroupArrivalTime`, { method: "POST", body: JSON.stringify({ groupId: groupId, arrivalTime: time }) })
            if (!response.ok) { throw new Error() }
            toast.success("Arrival time suggested successfully")
        } catch {
            toast.error("An error occured while suggesting arrival time")
        }
    }
}
