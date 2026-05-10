import { Dispatch, SetStateAction, useState } from "react"

export type stateType = {
    id: string,
    users: getSet<string[]>,
    arrivalTime: getSet<string | undefined>,
    destinationLatLng: getSet<[string, string] | undefined>,
    ownerAccount: getSet<boolean>,
    activity: getSet<string>,
    updateGroupState: (undefined | (() => Promise<void>))
}

export type getSet<T> = {
    value: T,
    setValue: Dispatch<SetStateAction<T>>
}

export function createState<T>(initialValue: T): getSet<T> {
    const [value, setValue] = useState<T>(initialValue)

    return {
        value,
        setValue
    }
}