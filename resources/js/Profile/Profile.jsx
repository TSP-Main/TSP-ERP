import React, { useContext } from 'react'

import UserContext from '../context/userContext'
import UserContextProvider from '../context/UserContextProvider'

const Profile = () => {
    const {user}=useContext(UserContext)
    if(!user) return <h3>User not found</h3>
  return (
   
      <UserContextProvider>
        <h1>Profile {user}</h1>
        <p>This is the profile page</p>
      </UserContextProvider>
   
  )
}

export default Profile
