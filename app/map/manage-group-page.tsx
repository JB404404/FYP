import { useState } from "react"
import { stateType } from "./getSet";
import { toast } from "sonner";

export default function ManageGroupPage({ stateObject }: {
    stateObject: stateType
}) {

    const [email, setEmail] = useState<string>("")
    const [firstLoad, setFirstLoad] = useState(true);
    const [loading, setLoading] = useState<boolean>(false)
    const [userEmails, setUserEmails] = useState<string[]>(stateObject.users.value)
    const [recommendedActivities, setRecommendedActivities] = useState<{ time: string, activity: string, location: [number, number], placeName: string | undefined }[]>([]);

    const groupId = stateObject?.id;

    const getUsers = async () => {
        setLoading(true)
        setUserEmails([])
        if (stateObject.updateGroupState) {
            const groupJson = await stateObject.updateGroupState()
            if (groupJson) {
                setUserEmails(groupJson.users)
            }
            setLoading(false)
        }

    }

    const addUserToGroup = async (targetEmail: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/addUserToGroup`,
                { method: "POST", body: JSON.stringify({ groupId: groupId, email: targetEmail }) }
            )
            if (!response.ok) { throw new Error() }
            setEmail("")
            toast.success("User successfully added to group")
            await getUsers()
        } catch {
            toast.error("An error occured while adding user to group")
        } finally {
            setLoading(false)
        }

    }
    const removeUserFromGroup = async (targetEmail: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/removeUserFromGroup`,
                { method: "POST", body: JSON.stringify({ groupId: groupId, email: targetEmail }) })
            if (!response.ok) { throw new Error() }
            setEmail("")
            toast.success("User successfully removed from group")
            await getUsers()
        } catch {
            toast.error("An error occurred while removing user from group")
        } finally {
            setLoading(false)
        }

    }

    const getRecommendedActivity = async (groupId: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/getRecommendedActivity?groupId=${groupId}`)
            if (!response.ok) { throw new Error() }
            const responseJson = await response.json()
            setRecommendedActivities(responseJson.topThree)
            toast.success("Recommended activities found")
        } catch {
            toast.success("An error occured while calculating recommended activities")
        } finally {
            setLoading(false)
        }

    }

    // updates both the group arrival time and the activity/destination for the group to match the provided values
    const setValues = async (item: { time: string, activity: string, location: [number, number], placeName: string | undefined }) => {
        setLoading(true)
        try {
            const responses = await Promise.all([
                fetch(`/api/setGroupArrivalTime`, { method: "POST", body: JSON.stringify({ groupId: groupId, arrivalTime: item.time }) }),
                fetch(`/api/setGroupDestinationAndActivity`, { method: "POST", body: JSON.stringify({ groupId: groupId, lat: item.location[0], lng: item.location[1], activity: item.activity, placeName: item.placeName }) }),
            ])
            if (!responses[0].ok && !responses[1].ok) {
                toast.error("An error occured whilst setting arrival time, activity and destination")
                throw new Error()
            }
            else if (!responses[0].ok) {
                toast.error("An error occured whilst setting arrival time")
                toast.success("Successfully set the activity and destination")
            }
            else if (!responses[1].ok) {
                toast.error("An error occured whilst setting activity and destination")
                toast.success("Successfully set the arrival time")
            } else {
                toast.success("Successfully set the arrival time, activity and destination")
            }
            if (stateObject.updateGroupState) {
                await stateObject.updateGroupState()
            }
            setRecommendedActivities([])
        } finally {
            setLoading(false)
        }

    }

    if (firstLoad) {
        setFirstLoad(false);
        getUsers();
    }

    return <div className='sub-page'>
        {stateObject.ownerAccount.value && <div className='sub-page-button-container'>

            <button onClick={async () => { getRecommendedActivity(groupId) }} disabled={loading} className='button'>Recommended activities</button>
            <div className='recommendations'>
                {recommendedActivities.map((item, index: number) => (
                    <div className='recommendation-list-item' key={index}>

                        <div>{index + 1}. {item.activity}</div>
                        <div>{(new Date(item.time)).toLocaleString()}</div>

                        <button className="select-button" disabled={loading} onClick={() => (setValues(item))}>Select</button>
                    </div>
                ))}
            </div>
            <hr className="page-split" />
            <input className='text-input'
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
            />
            <button onClick={async () => { addUserToGroup(email) }} disabled={loading} className='button'>Add to group</button>
            <button onClick={async () => { removeUserFromGroup(email) }} disabled={loading} className='button'>Remove user from group</button>
            <hr className="page-split" />
        </div>
        }
        <div className='sub-page-button-container'>
            <button onClick={async () => { getUsers() }} disabled={loading} className='button'>Reload users</button>
            <div>Group members:</div>
            {loading && <div>Loading...</div>}
            {userEmails.map((item, index: number) => (
                <div className='list-item' key={index}>{item}</div>
            ))}
        </div>
    </div >
}