import { useState } from "react"
import { stateType } from "./getSet";

export default function ManageGroupPage({ stateObject }: {
    stateObject: stateType
}) {

    const [email, setEmail] = useState<string>("")
    const [firstLoad, setFirstLoad] = useState(true);
    const [loading, setLoading] = useState<boolean>(false)
    const [userEmails, setUserEmails] = useState<string[]>(stateObject.users.value)
    const [recommendedActivities, setRecommendedActivities] = useState<{ time: string, activity: string, location: [number, number] }[]>([]);

    const groupId = stateObject?.id;

    const getUsers = async () => {
        setLoading(true)
        setUserEmails([])
        if (stateObject.updateGroupState) {
            await stateObject.updateGroupState()
        }
        setUserEmails(stateObject.users.value)
        setLoading(false)
    }

    const addUserToGroup = async (targetEmail: string) => {
        setLoading(true)
        setUserEmails([])
        await fetch(`/api/addUserToGroup`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, email: targetEmail }) }
        )
        setEmail("")
        await getUsers()
        setLoading(false)
    }
    const removeUserFromGroup = async (targetEmail: string) => {
        setLoading(true)
        setUserEmails([])
        await fetch(`/api/removeUserFromGroup`,
            { method: "POST", body: JSON.stringify({ groupId: groupId, email: targetEmail }) })
        setEmail("")
        await getUsers()
        setLoading(false)
    }

    const getRecommendedActivity = async (groupId: string) => {
        setLoading(true)
        const response = await fetch(`/api/getRecommendedActivity?groupId=${groupId}`)
        const responseJson = await response.json()
        setRecommendedActivities(responseJson.topThree)
        setLoading(false)
    }

    const setValues = async (item: { time: string, activity: string, location: [number, number] }) => {
        setLoading(true)
        await Promise.all([
            fetch(`/api/setGroupArrivalTime`, { method: "POST", body: JSON.stringify({ groupId: groupId, arrivalTime: item.time }) }),
            fetch(`/api/setGroupDestinationAndActivity`, { method: "POST", body: JSON.stringify({ groupId: groupId, lat: item.location[0], lng: item.location[1], activity: item.activity  }) }),
        ])
        if (stateObject.updateGroupState) {
            await stateObject.updateGroupState()
        }
        setRecommendedActivities([])
        setLoading(false)
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

                        <button className="select-button" onClick={() => (setValues(item))}>Select</button>
                    </div>
                ))}
            </div>
            <hr className="page-split"/>
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