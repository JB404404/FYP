'use client'
import { useState } from "react";
import { stateType } from "./getSet";

export default function AvailabilityPage({ stateObject }: {
    stateObject: stateType
}) {

    const [timeFrames, setTimeFrames] = useState<string[]>([])
    const [settingArrivalTime, setSettingArrivalTime] = useState<boolean>(false)
    const [arrivalTime, setArrivalTime] = useState<string>("")
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)

    const availabilityOptions: [string, number][] = [["Available", 1], ["Will arrive a bit late", 0.7], ["Can't make it", 0]];

    const groupId = stateObject?.id;

    const getTimeFrames = async () => {
        setLoading(true)
        setTimeFrames([])
        const response = await fetch(`/api/getTimeFrames?groupId=${groupId}`)
        const responseJson = await response.json()
        setTimeFrames(responseJson.timeFrames)
        setLoading(false)
    }

    const setAvailability = async (availability: number | undefined) => {
        if (availability != undefined) {
            setLoading(true)
            await fetch(`/api/setAvailability`,
                { method: "POST", body: JSON.stringify({ groupId: groupId, availability: availability, dateTime: selectedTimeFrame }) })
            setSelectedTimeFrame(undefined)
            setLoading(false)
        }
    }


    if (firstLoad) {
        setFirstLoad(false);
        getTimeFrames();
    }

    return <div className='sub-page'>
        {(!selectedTimeFrame && !settingArrivalTime) && <div className='sub-page-button-container'>


            <input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
            <button onClick={async () => { setSettingArrivalTime(true) }} className='button'>Set group's arrival time</button>
            <button onClick={async () => { suggestGroupArrivalTime(groupId, arrivalTime) }} className='button'>Suggest arrival time</button>
            <hr className="page-split" />
            <button onClick={async () => { getTimeFrames() }} disabled={loading} className='button'>Reload time frames</button>
            <div>Set availability for:</div>
            {loading && <div>Loading...</div>}
            {timeFrames.map((item, index: number) => (

                <button className='button' key={index} onClick={() => { setSelectedTimeFrame(item) }}>{(new Date(item)).toLocaleString()}</button>

            ))}
        </div>}
        {settingArrivalTime && <button onClick={async () => { setSettingArrivalTime(false) }} className='button'>Cancel</button>}
        {settingArrivalTime && <div className='sub-page-button-container'>
            {timeFrames.map((item, index: number) => (

                <button className='value-input-button' key={index} onClick={() => { setGroupArrivalTime(groupId, item) }}>{(new Date(item)).toLocaleString()}</button>

            ))}</div>}

        {selectedTimeFrame && <div>
            <button className='button' onClick={() => { setSelectedTimeFrame(undefined) }}>Choose different time frame</button>
        </div>}

        {selectedTimeFrame && <div className='sub-page-button-container'>
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
