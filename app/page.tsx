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
      <button onClick={async () => { fetch("/api/createGroup", { method: "POST", body: JSON.stringify({ name: "testGroupName" }) }) }} className="button">Create group</button>
      <button onClick={async () => { updateGroups() }} className="button">Get your groups</button>

    </span>
    <span className='button-container'>
      {groups.map((item, index) => (
        <span key={index}>
          <button className="button" onClick={() => (redirect(`/map?id=${item.id}&lat=${item?.destinationLatLng?.[0] || ""}&lng=${item?.destinationLatLng?.[1] || ""}&arrivalTime=${item?.arrivalTime || ""}`))}>{item.name}</button>
        </span>
      ))}
    </span>
  </span>
}