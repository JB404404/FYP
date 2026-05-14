import { Dispatch, SetStateAction, useState } from "react"

// defines the class structure for the current group information
export type stateType = {
    id: string,
    users: getSet<string[]>,
    arrivalTime: getSet<string | undefined>,
    destinationLatLng: getSet<[string, string] | undefined>,
    placeName: getSet<string | undefined>,
    ownerAccount: getSet<boolean>,
    activity: getSet<string>,
    updateGroupState: (undefined | (() => Promise<void>))
}

// defines the structure of a type containing the getter and setter of a 'useState'
export type getSet<T> = {
    value: T,
    setValue: Dispatch<SetStateAction<T>>
}

// defines a function to create a useState in a compressed format, 
// to make code more readable
export function createState<T>(initialValue: T): getSet<T> {
    const [value, setValue] = useState<T>(initialValue)

    return {
        value,
        setValue
    }
}