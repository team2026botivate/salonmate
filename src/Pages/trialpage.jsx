import React from 'react'
import { useGetStaffData } from '../hook/dbOperation'

const TrialPage = () => {
  const { data } = useGetStaffData()
  console.log(data, 'data')
  return (
    <div className="text-black">
      
      {data?.map((item) => (
        <div key={item.id}>
          <p>{item.staff_name}</p>
          <p>{item.staff_number}</p>
        </div>
      ))}

      {/* <h1>data</h1> */}
    </div>
  )
}

export default TrialPage
