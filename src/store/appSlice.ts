import { createSlice } from '@reduxjs/toolkit'

import { sanitizeSensitiveData } from 'src/utils/sensitive-data'

export interface IAppState {
  userLoggedIn: boolean
  serverUrl: string
  connectionMode: 'local' | 'online'
  themeMode: 'light' | 'dark'
  userConnected: any
  desktopSecurityChecked: boolean
  desktopSecurityBlocked: boolean
  desktopSecurityMessage: string
  desktopSecurityExpiresAt: string
  desktopSecurityIsSuperAdmin: boolean
  desktopSecurityDaysRemaining: number
  desktopSecurityMachineCurrent: boolean
  desktopSecurityMachineDescription: string
  desktopSecurityCurrentMachineDescription: string
}

export const appSlice: any = createSlice({
  name: 'application',
  initialState: {
    userLoggedIn: false,
    serverUrl: '',
    connectionMode: 'local',
    themeMode: 'light',
    userConnected: {},
    desktopSecurityChecked: false,
    desktopSecurityBlocked: false,
    desktopSecurityMessage: '',
    desktopSecurityExpiresAt: '',
    desktopSecurityIsSuperAdmin: false,
    desktopSecurityDaysRemaining: 0,
    desktopSecurityMachineCurrent: true,
    desktopSecurityMachineDescription: '',
    desktopSecurityCurrentMachineDescription: '',
  },

  reducers: {
    setServerUrl: (state, action) => {
      state.serverUrl = action.payload
    },

    setConnectionMode: (state, action) => {
      state.connectionMode = action.payload
    },

    setThemeMode: (state, action) => {
      state.themeMode = action.payload
    },

    setUserLoggedIn: (state, action) => {
      state.userLoggedIn = action.payload
    },

    setUserConnected: (state, action) => {
      state.userConnected = sanitizeSensitiveData(action.payload)
    },

    setDesktopSecurityStatus: (state, action) => {
      state.desktopSecurityChecked = Boolean(action.payload?.checked)
      state.desktopSecurityBlocked = Boolean(action.payload?.isBlocked)
      state.desktopSecurityMessage = action.payload?.message || ''
      state.desktopSecurityExpiresAt = action.payload?.expiresAt || ''
      state.desktopSecurityIsSuperAdmin = Boolean(action.payload?.isSuperAdmin)
      state.desktopSecurityDaysRemaining = Number(action.payload?.daysRemaining || 0)
      state.desktopSecurityMachineCurrent = action.payload?.machineBinding?.isCurrentMachine !== false
      state.desktopSecurityMachineDescription = action.payload?.machineBinding?.description || ''
      state.desktopSecurityCurrentMachineDescription = action.payload?.machineBinding?.currentDescription || ''
    },

    resetDesktopSecurityStatus: (state) => {
      state.desktopSecurityChecked = false
      state.desktopSecurityBlocked = false
      state.desktopSecurityMessage = ''
      state.desktopSecurityExpiresAt = ''
      state.desktopSecurityIsSuperAdmin = false
      state.desktopSecurityDaysRemaining = 0
      state.desktopSecurityMachineCurrent = true
      state.desktopSecurityMachineDescription = ''
      state.desktopSecurityCurrentMachineDescription = ''
    },
  },
})

export const {
  setServerUrl,
  setConnectionMode,
  setThemeMode,
  setUtilisateurs,
  setUserLoggedIn,
  setUserConnected,
  setDesktopSecurityStatus,
  resetDesktopSecurityStatus,
} = appSlice.actions

export default appSlice.reducer
