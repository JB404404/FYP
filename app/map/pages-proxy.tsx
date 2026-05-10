'use client'
import { Dispatch, SetStateAction, Suspense, useState } from 'react';
import ClientMap from './client-map';
import RatingPage from './rating-page';
import AvailabilityPage from './availability-page';
import ManageGroupPage from './manage-group-page';
import { redirect } from 'next/navigation';
import { createState, stateType } from './getSet';


type pageChoice = "map" | "activity" | "availability" | "manageGroup";


export default function PagesProxy({ groupId }: { groupId: string }) {
    const [selectedPage, setSelectedPage] = useState<pageChoice>("map");
    const [arrivalTime, setArrivalTime] = useState<string>("");

    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const stateObject: stateType = {
        id: groupId,
        users: createState<string[]>([]),
        arrivalTime: createState<string | undefined>(undefined),
        destinationLatLng: createState<[string, string] | undefined>(undefined),
        ownerAccount: createState<boolean>(false),
        activity: createState<string>(""),
        updateGroupState: undefined
    }
    stateObject.updateGroupState = () => (getGroupInformation(groupId, stateObject, setArrivalTime));

    if (firstLoad) {
        setFirstLoad(false);
        stateObject.updateGroupState();
    }

    return (
        <div className='proxy-container'>
            <div className='page-selection'>
                <button onClick={async () => { redirect("/") }} className='button'>Back to groups</button>
                <button onClick={() => (setSelectedPage("map"))} disabled={selectedPage == "map"} className='button'>Map</button>
                <button onClick={() => (setSelectedPage("activity"))} disabled={selectedPage == "activity"} className='button'>Activity</button>
                <button onClick={() => (setSelectedPage("availability"))} disabled={selectedPage == "availability"} className='button'>Availability</button>
                <button onClick={() => (setSelectedPage("manageGroup"))} disabled={selectedPage == "manageGroup"} className='button'>Group information</button>
            </div>
            <div className='group-information'>
                <div className='information-container'>Activity: {(stateObject.activity.value != "") ? stateObject.activity.value : "-"}</div>
                <div className='information-container'>Arrival time: {(!!arrivalTime && arrivalTime != "") ? (new Date(arrivalTime)).toLocaleString() : "-"}</div>
                <div className='information-container'>Location: {(!!stateObject.destinationLatLng.value) ? `${stateObject.destinationLatLng.value[0].toString().substring(0, 5)}, ${stateObject.destinationLatLng.value[1].toString().substring(0, 5)}` : "-"}</div>
            </div>

            <div className='proxied-page'>
                {(selectedPage == "map") && <Suspense fallback={<div>Loading map...</div>}>
                    <ClientMap stateObject={stateObject} />
                </Suspense>}
                {(selectedPage == "activity") && <Suspense fallback={<div>Loading activities...</div>}>

                    <RatingPage stateObject={stateObject} />
                </Suspense>
                }
                {(selectedPage == "availability") && <Suspense fallback={<div>Loading availability...</div>}>

                    <AvailabilityPage stateObject={stateObject} />
                </Suspense>
                }
                {(selectedPage == "manageGroup") && <Suspense fallback={<div>Loading group management...</div>}>

                    <ManageGroupPage stateObject={stateObject} />
                </Suspense>
                }
            </div>
        </div>
    )
}


async function getGroupInformation(groupId: string, stateObject: stateType, updateArrivalTime: Dispatch<SetStateAction<string>>): Promise<void> {
    const groupInformationResponse = await fetch(`api/getGroupInformation?groupId=${groupId}`);
    return groupInformationResponse.json().then((groupInfo) => {
        stateObject.users.setValue(groupInfo.users)
        stateObject.arrivalTime.setValue(groupInfo.arrivalTime)
        stateObject.destinationLatLng.setValue(groupInfo.destinationLatLng)
        stateObject.ownerAccount.setValue(groupInfo.ownerAccount)
        stateObject.activity.setValue(groupInfo.activity)
        updateArrivalTime(groupInfo.arrivalTime)
        return;
    });

}
