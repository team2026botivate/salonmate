import LicenseManagement from './components/license/licenseManagement'

function App() {
  const mockLicenseData = {
    licenseKey: 'SALON-MATE-2024-PREMIUM-ABCD-EFGH-1234',
    expirationDate: '2024-02-15T23:59:59.000Z', // This will show "Expiring Soon"
    isActive: true,
  } 
  return (
    <div className="App">
      <LicenseManagement
        licenseKey={mockLicenseData.licenseKey}
        expirationDate={mockLicenseData.expirationDate}
        isActive={mockLicenseData.isActive}
      />
    </div>
  )
}

export default App
