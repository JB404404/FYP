'use client'
import { redirect } from 'next/navigation';
import { Suspense, useState } from 'react';
import AvailabilityPage from './availability-page';
import ClientMap from './client-map';
import { createState, stateType } from './getSet';
import ManageGroupPage from './manage-group-page';
import RatingPage from './rating-page';
import { toast, Toaster } from 'sonner';


type pageChoice = "map" | "activity" | "availability" | "manageGroup";


export default function PagesProxy({ groupId }: { groupId: string }) {
    // Server component to handle search parameter inputs for the client side components

    const [selectedPage, setSelectedPage] = useState<pageChoice>("map");
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    // defines the state object for the group the user is currently viewing
    const stateObject: stateType = {
        id: groupId,
        users: createState<string[]>([]),
        arrivalTime: createState<string | undefined>(undefined),
        destinationLatLng: createState<[string, string] | undefined>(undefined),
        placeName: createState<string | undefined>(undefined),
        ownerAccount: createState<boolean>(false),
        activity: createState<string>(""),
        updateGroupState: undefined
    }
    //defines a function within the object that allows the object to be updated from its own reference
    stateObject.updateGroupState = async () => (await getGroupInformation(groupId, stateObject));

    if (firstLoad) {
        setFirstLoad(false);
        stateObject.updateGroupState();
    }

    return (
        <div className='proxy-container'>
            <div className='page-selection'>
                <div className='scrollable-container'>
                    <button onClick={async () => { redirect("/") }} className='button'>Back to groups</button>
                    <button onClick={() => (setSelectedPage("map"))} disabled={selectedPage == "map"} className='button'>Map</button>
                    <button onClick={() => (setSelectedPage("activity"))} disabled={selectedPage == "activity"} className='button'>Activity</button>
                    <button onClick={() => (setSelectedPage("availability"))} disabled={selectedPage == "availability"} className='button'>Availability</button>
                    <button onClick={() => (setSelectedPage("manageGroup"))} disabled={selectedPage == "manageGroup"} className='button'>Group information</button>
                </div>
            </div>
            <div className='group-information'>
                <div className='information-container'>Activity: {(stateObject.activity.value != "") ? stateObject.activity.value : "-"}{!!stateObject.placeName.value ? ` at ${stateObject.placeName.value}` : ""}</div>
                <div className='information-container'>Arrival time: {(!!stateObject.arrivalTime.value && stateObject.arrivalTime.value != undefined) ? (new Date(stateObject.arrivalTime.value)).toLocaleString() : "-"}</div>
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
            <Toaster />
        </div>
    )
}

// Updates the state of the group for this component and its child components
async function getGroupInformation(groupId: string, stateObject: stateType): Promise<void> {
    try {
        const groupInformationResponse = await fetch(`api/getGroupInformation?groupId=${groupId}`);
        if (!groupInformationResponse.ok) { throw new Error() }
        return groupInformationResponse.json().then((groupInfo) => {
            stateObject.users.setValue(groupInfo.users)
            stateObject.arrivalTime.setValue(groupInfo.arrivalTime)
            stateObject.destinationLatLng.setValue(groupInfo.destinationLatLng)
            stateObject.placeName.setValue(groupInfo.placeName)
            stateObject.ownerAccount.setValue(groupInfo.ownerAccount)
            stateObject.activity.setValue(groupInfo.activity)
            toast.success("Current group information updated successfully")
            return;
        });
    } catch {
        toast.error("There was an error updating information for the current group")
    }


}
