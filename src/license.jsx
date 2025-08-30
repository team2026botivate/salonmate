import LicenseManagement from './components/license/licenseManagement'
import { useLicense } from './zustand/license'

function App() {
  const licenseData = useLicense((state) => state?.licenseData)

  return (
    <div className="App">
      <LicenseManagement
        expirationDate={licenseData?.expiryDate}
        isActive={licenseData.active}
      />
    </div>
  )
}

export default App
