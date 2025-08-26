// SalonConfig.js

// Configuration for all salons in the system
export const SALON_CONFIGS = [
    {
      id: "salon-a",
      name: "Salon A",
      sheetId: "1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w",
      loginSheetName: "Login",
      bookingSheetName: "Booking DB",
      staffSheetName: "Staff DB",
      serviceSheetName: "Service DB",
      appScriptUrl: "https://script.google.com/macros/s/AKfycbx-5-79dRjYuTIBFjHTh3_Q8WQa0wWrRKm7ukq5854ET9OCHiAwno-gL1YmZ9juotMH/exec"
    },
    {
      id: "salon-b",
      name: "Salon B",
      sheetId: "1Kb-fhC1yiFJCyPO7TJDqnu-lQ1n1H6mLErlkSPc6yHc", // Replace with your second salon's sheet ID
      loginSheetName: "Login",
      bookingSheetName: "Booking DB",
      staffSheetName: "Staff DB",
      serviceSheetName: "Service DB",
      appScriptUrl: "https://script.google.com/macros/s/AKfycbyhmDsXWRThVsJCfAirTsI3o9EGE-oCcw2HKz1ERe4qxNWfcVoxMUr3sGa6yHJm-ckt/exec" // Replace with your second salon's App Script URL
    },
    // Add more salons as needed
  ];
  
  // Helper function to get a salon config by ID
  export const getSalonConfigById = (id) => {
    return SALON_CONFIGS.find(salon => salon.id === id) || null;
  };