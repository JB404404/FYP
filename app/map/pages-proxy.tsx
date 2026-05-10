'use client'
import { Suspense, useState } from 'react';
import ClientMap from './client-map';
import RatingPage from './rating-page';
import AvailabilityPage from './availability-page';
import ManageGroupPage from './manage-group-page';
import { redirect } from 'next/navigation';


type pageChoice = "map" | "activity" | "availability" | "manageGroup";

export default function PagesProxy({ searchParams }: { searchParams: any }) {
    const [selectedPage, setSelectedPage] = useState<pageChoice>("map")
    return (
        <div className='proxy-container'>
            <div className='page-selection'>
                <button onClick={async () => { redirect("/") }} className='button'>Back to groups</button>
                <button onClick={() => (setSelectedPage("map"))} className='button'>Map</button>
                <button onClick={() => (setSelectedPage("activity"))} className='button'>Activity</button>
                <button onClick={() => (setSelectedPage("availability"))} className='button'>Availability</button>
                <button onClick={() => (setSelectedPage("manageGroup"))} className='button'>Group information</button>
            </div>
            <div>
                <div>Arrival time: {searchParams?.arrivalTime ? (new Date(searchParams.arrivalTime)).toLocaleString() : "-"}</div>
            </div>

            <div>
                {(selectedPage == "map") && <Suspense fallback={<div>Loading map...</div>}>
                    <div><ClientMap searchParams={searchParams} /></div>
                </Suspense>}
                {(selectedPage == "activity") && <Suspense fallback={<div>Loading activities...</div>}>
                    <div>
                        <RatingPage searchParams={searchParams} />
                    </div></Suspense>
                }
                {(selectedPage == "availability") && <Suspense fallback={<div>Loading availability...</div>}>
                    <div>
                        <AvailabilityPage searchParams={searchParams} />
                    </div></Suspense>
                }
                {(selectedPage == "manageGroup") && <Suspense fallback={<div>Loading group management...</div>}>
                    <div>
                        <ManageGroupPage searchParams={searchParams} />
                    </div></Suspense>
                }
            </div>
        </div>
    )
}
