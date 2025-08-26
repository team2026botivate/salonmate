import supabase from '@/dataBase/connectdb'
import React, { useEffect } from 'react'

const TrialPage = () => {
  const auth = async () => {
    const { user, error } = await supabase.auth.signUp({
      email: 'team1.interns@botivate.in',
      password: 'mozammil@123',
      options: {
        role: 'admin',
      },
    })
    console.log(user)
    console.log(error)
  }

  useEffect(() => {
    auth()
  }, [])
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black text-white">
      TrialPage
    </div>
  )
}

export default TrialPage
