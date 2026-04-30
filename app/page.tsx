'use client'

import { redirect } from "next/navigation";
import Router from "next/router";
import { useState } from "react";

export default function Home() {

  const [groups, setGroups] = useState([] as any[]);

  const updateGroups = async () => {
    const response = await fetch("/api/getUserGroups")
    setGroups((await response.json()).groupInfo)
  }

  return <span className='button-board'>
    <span className='button-container'>
      <button onClick={async () => { window.location.href = "/google-login" }} className="button">Log in with google</button>
      <button onClick={async () => { fetch("/api/createGroup") }} className="button">Create group</button>
      <button onClick={async () => { fetch("/api/addUserToGroup") }} className="button">Add to group</button>
      <button onClick={async () => { fetch("/api/removeUserFromGroup") }} className="button">Remove user from group</button>
      <button onClick={async () => { updateGroups() }} className="button">Get your groups</button>
      <button onClick={async () => { fetch("/api/setGroupDestination") }} className="button">Set a group's destination</button>
    </span>
    <span className='button-container'>
      {groups.map((item, index) => (
        <button className="button" key={index} onClick={() => (redirect(`/map?id=${item.id}&lat=${item?.destinationLatLng[0] || 0}&lng=${item?.destinationLatLng[1] || 0}`))}>{item.name}</button>
      ))}
    </span>
  </span>
}