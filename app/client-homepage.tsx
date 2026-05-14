'use client'

import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ClientHomepage({ loggedIn }: { loggedIn: boolean }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [newGroupName, setNewGroupName] = useState("");
    const [groups, setGroups] = useState([] as any[]);


    const updateGroups = async () => {
        try {
            const response = await fetch("/api/getUserGroups")
            if (!response.ok) { throw new Error() }
            setGroups((await response.json()).groupInfo)
        } catch {
            toast.error("There was an error loading groups")
        }
    }
    if (firstLoad && loggedIn) {
        setFirstLoad(false);
        updateGroups();
    }

    return <div className='button-board'>
        {!loggedIn &&
            <div className='button-container'>
                <button onClick={async () => { window.location.href = "/google-login" }} className='button'>Log in with Google</button>
            </div>}
        {loggedIn &&
            <div className='button-container'>
                <input type="text" placeholder="Group name..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className='button' />
                <button onClick={async () => { const createResponse = await fetch("/api/createGroup", { method: "POST", body: JSON.stringify({ name: newGroupName }) }); if (createResponse.ok) { updateGroups(); toast.success("Group created successfully") } else { toast.error("An error occurred creating the group") } }} className='button'>Create group</button>
                <button onClick={async () => { updateGroups() }} className='button'>Reload groups</button>
                <div className='button-list'>
                    <div>Your Groups:</div>
                    {groups?.map((item, index) => (
                        <div key={index}>
                            <button className='button' onClick={() => (redirect(`/map?id=${item.id}`))}>{item.name}</button>
                        </div>
                    ))}
                </div>
            </div>}
    </div>
}