import React from 'react'
import TransactionFunctionality from './transactionFunctionnality'
// import { toast } from 'react-toastify'
import toast from 'react-hot-toast'
import { useCreateTransaction } from '../../hook/dbOperation'
// Demo wrapper component
const TransactionsPanel = ({ setIsEditModalOpen, transactionFromData }) => {
  const { createTransaction, loading, error } = useCreateTransaction()

  const mockBaseService = {
    name: transactionFromData?.service_name,
    price: transactionFromData?.service_price,
  }

  // Mock submit handler
  const handleSubmit = async (payload) => {

    
    await createTransaction(payload)
    if (!error) {
      toast.success('Transaction created successfully')
      setIsEditModalOpen(false)
    } else {
      toast.error('Transaction failed')
    }
  }

  // useEffect(() => {
  //   setMockBaseService({
  //     name: transactionFromData?.Services,
  //     price: transactionFromData?.['Service Price'] || '0',
  //   })
  // }, [transactionFromData])

  return (
    <TransactionFunctionality
      loadingForSubmit={loading}
      appointmentId={transactionFromData?.id}
      baseService={mockBaseService}
      onSubmit={handleSubmit}
      extraServices={transactionFromData?.extra_services}
      setIsEditModalOpen={setIsEditModalOpen}
    />
  )
}

export default TransactionsPanel
