// This utility file contains functions to interact with Google Sheets

// Function to fetch data from a specific Google Sheet
export const fetchSheetData = async (sheetId, sheetName) => {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      // Extract the JSON part from the response
      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);
      
      return data;
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      throw error;
    }
  };
  
  // Helper function to convert Google Sheet data to array of objects
  export const parseSheetData = (sheetData) => {
    if (!sheetData.table || !sheetData.table.rows || !sheetData.table.cols) {
      throw new Error("Invalid sheet data format");
    }
    
    const headers = sheetData.table.cols.map(col => col.label || col.id);
    
    return sheetData.table.rows.map(row => {
      const item = {};
      headers.forEach((header, index) => {
        // Handle empty cells
        item[header] = row.c[index] ? row.c[index].v : null;
      });
      return item;
    });
  };
  
  // Function to make your code compatible with the Google Sheets API
  export const getSheetCellValue = (cell) => {
    if (!cell) return null;
    return cell.v;
  };
  
  // Function to get Google Sheet API URL with a query
  export const getSheetQueryUrl = (sheetId, sheetName, query) => {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&tq=${encodeURIComponent(query)}`;
  };
  
  // Utility function to make all components use the current logged-in salon's sheet
  export const fetchCurrentSalonSheet = async (sheetName, auth) => {
    const currentSheetId = auth.getCurrentSheetId();
    if (!currentSheetId) {
      throw new Error("No salon is currently selected");
    }
    
    return fetchSheetData(currentSheetId, sheetName);
  };
  
  // Function to format sheet data based on specific sheet types
  export const formatSheetData = (sheetData, sheetType) => {
    const rawData = parseSheetData(sheetData);
    
    switch (sheetType) {
      case 'booking':
        // Format booking data specifically 
        return rawData.map(item => ({
          id: item.ID || item.id,
          customerName: item.CustomerName || item.Name || "",
          service: item.Service || "",
          date: item.Date || "",
          time: item.Time || "",
          staffName: item.StaffName || item.Staff || "",
          status: item.Status || "Pending",
          contact: item.Contact || item.Phone || "",
          // Add other fields as needed
        }));
        
      case 'inventory':
        // Format inventory data specifically
        return rawData.map(item => ({
          id: item.ID || item.id,
          productName: item.ProductName || item.Name || "",
          quantity: parseInt(item.Quantity || "0"),
          price: parseFloat(item.Price || "0"),
          category: item.Category || "",
          // Add other fields as needed
        }));
        
      case 'services':
        // Format services data specifically
        return rawData.map(item => ({
          id: item.ID || item.id,
          serviceName: item.ServiceName || item.Name || "",
          duration: item.Duration || "",
          price: parseFloat(item.Price || "0"),
          category: item.Category || "",
          // Add other fields as needed
        }));
        
      default:
        // Return raw data for other sheet types
        return rawData;
    }
  };
  
  // Utility function for updating Google Sheets using Apps Script
  export const updateSheetWithAppScript = async (scriptUrl, payload) => {
    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating sheet:", error);
      throw error;
    }
  };