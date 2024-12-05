import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
const initialState = {
    error: false,
    loading: false,
    invitedmanagerdata: [],
    cancelInviteddata: [],
    newRegisteredManagers: [],
    activeManagersdata: [],
    InActiveManagersdata: [],
    activeEmployeedata: [],
};

export const createManager = createAsyncThunk(
    "manager/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                apiRoutes.manager.create,
                payload
            );
        } catch (error) {
            return rejectWithValue(
                error.message || "failed to fetch InvitedManagers"
            );
        }
    }
);
export const gettinvitedManager = createAsyncThunk(
    "manager/invite",
    async (code, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.manager.getInvitedManagers(code)
            );
            console.log("response", response.data.data);

            return response.data.data.data;
        } catch (error) {
            console.log("redux error in invited Managers: " + error);
            return rejectWithValue(
                error.message || "failed to fetch InvitedManagers"
            );
        }
    }
);
export const gettCancelledInvitedManagers = createAsyncThunk(
    "manager/getCancelledInvited",
    async (code, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.manager.getCancelledInvitedManagers(code)
            );
            console.log("response", response.data.data);

            return response.data.data.data;
        } catch (error) {
            return rejectWithValue(
                error.message || "failed to fetch Cancelled Invited Managers"
            );
        }
    }
);
export const gettNewRegisteredManagers = createAsyncThunk(
    "manager/getNewRegisteredManagers",
    async (code, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.manager.getNewRegisteredManagers(code)
            );
            console.log("response", response.data.data);

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.message || "failed to fetch Cancelled Invited Managers"
            );
        }
    }
);
export const assignManager = createAsyncThunk(
    "manager/assign",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                apiRoutes.manager.assignManager,
                payload
            );
        } catch (error) {
            return rejectWithValue(
                error || "failed to fetch Cancelled Invited Managers"
            );
        }
    }
);
export const gettActiveManagers = createAsyncThunk(
    "manager/getActiveManagers",
    async (code, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.manager.getActiveManagers(code)
            );
            console.log("response", response.data.data);

            return response.data.data.data;
        } catch (error) {
            return rejectWithValue(
                error.message || "failed to fetch Cancelled Invited Managers"
            );
        }
    }
);
export const gettInActiveManagers = createAsyncThunk(
    "manager/getInActiveManagers",
    async (code, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.manager.getInActiveManagers(code)
            );
            console.log("response", response.data.data);

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.message || "failed to fetch Cancelled Invited Managers"
            );
        }
    }
);

export const allEmployeeM = createAsyncThunk(
    "user/employee",
    async ({ code, id }, { rejectWithValue }) => {
        try {
            // console.log("Users", code, role);
            // console.log("Employeeseses", { role });
            const response = await axios.get(apiRoutes.employee.active(code), {
                params: {
                    manager_id: id,
                },
            });
            console.log("employee", response.data.data.data);
            if (response?.data?.data.length == 0) {
                return [];
            } else {
                return response.data.data.data;
            }
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);
export const inActiveEmployeeM = createAsyncThunk(
    "user/inacticeemployee",
    async ({ code, id }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.employee.inactive(code),
                {
                    params: {
                        manager_id: id,
                    },
                }
            );
            console.log("employee", response.data.data.data);
            return response.data.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);
export const getInvitedUsers = createAsyncThunk(
    "user/getInvitedUsers",
    async ({code,id}, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.employee.getInvitedUsers(code),{
                    params:{
                        manager_id:id,
                    }
                }
            );
            console.log("invited data", response.data.data.data);
            return response.data.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);

const managerSlice = createSlice({
    name: "manager",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(gettinvitedManager.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(gettinvitedManager.fulfilled, (state, action) => {
                state.invitedmanagerdata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(gettinvitedManager.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(gettCancelledInvitedManagers.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(
                gettCancelledInvitedManagers.fulfilled,
                (state, action) => {
                    state.cancelInviteddata = action.payload;
                    state.loading = false;
                    state.error = false;
                }
            )
            .addCase(gettCancelledInvitedManagers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(gettNewRegisteredManagers.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(gettNewRegisteredManagers.fulfilled, (state, action) => {
                state.newRegisteredManagers = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(gettNewRegisteredManagers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(gettActiveManagers.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(gettActiveManagers.fulfilled, (state, action) => {
                state.activeManagersdata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(gettActiveManagers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(gettInActiveManagers.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(gettInActiveManagers.fulfilled, (state, action) => {
                state.InActiveManagersdata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(gettInActiveManagers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(allEmployeeM.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(allEmployeeM.fulfilled, (state, action) => {
                state.activeEmployeedata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(allEmployeeM.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            });
    },
});

export default managerSlice.reducer;
