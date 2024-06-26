import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type IDormState = Record<string, {
    roomId: string;
    unread: number;
}>

export const dormSlice = createSlice({
    name: 'dorm',
    initialState: {},
    reducers: {
        setDorm(dorm: IDormState, action: PayloadAction<any>){
            dorm = action.payload
            return dorm
        }
    }
})

export const {
    setDorm
} = dormSlice.actions
export default dormSlice.reducer