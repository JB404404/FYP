'use client'

import { redirect } from "next/navigation";
import { useState } from "react";

export default function ClientHomepage({ loggedIn }: { loggedIn: boolean }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [newGroupName, setNewGroupName] = useState("");
    const [groups, setGroups] = useState([] as any[]);


    const updateGroups = async () => {
        const response = await fetch("/api/getUserGroups")
        setGroups((await response.json()).groupInfo)
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
                <button onClick={async () => { fetch("/api/createGroup", { method: "POST", body: JSON.stringify({ name: newGroupName }) }).then(() => (updateGroups())) }} className='button'>Create group</button>
                <button onClick={async () => { updateGroups() }} className='button'>Reload groups</button>
                <div className='button-list'>
                    <div>Your Groups:</div>
                    {groups.map((item, index) => (
                        <div key={index}>
                            <button className='button' onClick={() => (redirect(`/map?id=${item.id}`))}>{item.name}</button>
                        </div>
                    ))}
                </div>
            </div>}
    </div>
}