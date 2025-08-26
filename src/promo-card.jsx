"use client"

import React, { useState, useEffect } from 'react';
import { Tag, Search, Edit, Trash2, Plus, Save, X, Percent, Calendar } from 'lucide-react';
import { useAuth } from './Context/AuthContext';
const PromoCard = () => {
  // State for promo data and UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoList, setPromoList] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [newPromo, setNewPromo] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: ""
  });
  
  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  
  // Add state for edit form modal
  const [showEditForm, setShowEditForm] = useState(false);

  const { user } = useAuth()
  // Google Sheet Details - Replace with your actual sheet ID
  // const sheetId = '1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w';
  const sheetId = user?.sheetId || '1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w';
  const scriptUrl = user?.appScriptUrl || 'https://script.google.com/macros/s/AKfycbx-5-79dRjYuTIBFjHTh3_Q8WQa0wWrRKm7ukq5854ET9OCHiAwno-gL1YmZ9juotMH/exec';
  const sheetName = 'Promo Cards';

  // Google Apps Script Web App URL - Replace with your actual script URL
  // const scriptUrl = 'https://script.google.com/macros/s/AKfycbyhmDsXWRThVsJCfAirTsI3o9EGE-oCcw2HKz1ERe4qxNWfcVoxMUr3sGa6yHJm-ckt/exec';

  // Fetch promo data from Google Sheet
  useEffect(() => {
    const fetchGoogleSheetData = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch Google Sheet data...");

        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const text = await response.text();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        const jsonString = text.substring(jsonStart, jsonEnd + 1);
        const data = JSON.parse(jsonString);

        if (!data.table || !data.table.cols || data.table.cols.length === 0) {
          setError("No data found in the sheet");
          setLoading(false);
          return;
        }

        let headers = [];
        let allRows = data.table.rows || [];

        if (data.table.cols && data.table.cols.some(col => col.label)) {
          // Filter out delete column
          headers = data.table.cols
            .map((col, index) => ({
              id: `col${index}`,
              label: col.label || `Column ${index + 1}`,
              type: col.type || 'string',
              originalIndex: index // Store the original index for reference
            }))
            .filter((header, index) => {
              // Skip the delete flag column if it exists
              return !header.label.toLowerCase().includes('delete');
            });
        } else if (allRows.length > 0 && allRows[0].c && allRows[0].c.some(cell => cell && cell.v)) {
          // Filter out delete column
          headers = allRows[0].c
            .map((cell, index) => ({
              id: `col${index}`,
              label: cell && cell.v ? String(cell.v) : `Column ${index + 1}`,
              type: data.table.cols[index]?.type || 'string',
              originalIndex: index // Store the original index for reference
            }))
            .filter((header) => {
              // Skip the delete flag column if it exists
              return !header.label.toLowerCase().includes('delete');
            });
          allRows = allRows.slice(1);
        }

        setTableHeaders(headers);

        // Initialize new promo with empty values for all headers
        const emptyPromo = {};
        headers.forEach(header => {
          emptyPromo[header.id] = '';
        });
        setNewPromo(emptyPromo);

        // Define the index for the "deleted" flag column
        const deletedColumnIndex = data.table.cols.findIndex(col => 
          col.label && col.label.toLowerCase().includes('delete')
        );
        
        const promoData = allRows
          .filter((row) => {
            // Only include rows where delete column is NOT "Yes" (exclude deleted promos)
            const isDeleted = deletedColumnIndex !== -1 && 
                            row.c && 
                            row.c.length > deletedColumnIndex && 
                            row.c[deletedColumnIndex] && 
                            row.c[deletedColumnIndex].v === "Yes";
            
            return !isDeleted && row.c && row.c.some((cell) => cell && cell.v);
          })
          .map((row, rowIndex) => {
            const promoData = {
              _id: Math.random().toString(36).substring(2, 15),
              _rowIndex: rowIndex + 2, // +2 because of header row and 1-indexed
            };

            row.c && row.c.forEach((cell, index) => {
              // Skip delete column
              if (deletedColumnIndex !== -1 && index === deletedColumnIndex) return;

              // Find the corresponding header for this column
              const header = headers.find(h => h.originalIndex === index);
              if (!header) return;
              
              // Handle date values
              if (cell && cell.v && cell.v.toString().indexOf('Date') === 0) {
                const dateString = cell.v.toString();
                const dateParts = dateString.substring(5, dateString.length - 1).split(',');
                
                if (dateParts.length >= 3) {
                  const year = parseInt(dateParts[0]);
                  const month = parseInt(dateParts[1]) + 1;
                  const day = parseInt(dateParts[2]);
                  
                  // Format as DD/MM/YYYY
                  promoData[header.id] = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                } else {
                  promoData[header.id] = cell.v;
                }
              } else {
                // Handle non-date values
                promoData[header.id] = cell ? cell.v : '';
                
                if (header.type === 'number' && !isNaN(promoData[header.id])) {
                  promoData[header.id] = Number(promoData[header.id]).toLocaleString();
                }
              }
            });

            return promoData;
          });

        setPromoList(promoData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Google Sheet data:", error);
        setError("Failed to load promo data");
        setLoading(false);
      }
    };

    fetchGoogleSheetData();
  }, []);

  // Filter promos by search term
  const filteredPromos = promoList.filter(promo => {
    for (const key in promo) {
      if (promo[key] && String(promo[key]).toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }
    return false;
  });

  // Handle input change for new promo form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromo({
      ...newPromo,
      [name]: value
    });
  };

  // Handle clicking "Add Promo" button
  const handleAddPromo = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create a full array of data for all columns, including the hidden delete column
      const fullRowData = [];
      
      // Loop through all possible column indexes and add data in the correct positions
      const maxColumnIndex = Math.max(...tableHeaders.map(h => h.originalIndex)) + 1;
      
      for (let i = 0; i < maxColumnIndex + 1; i++) {
        // Find the header for this column index (if it exists in our filtered headers)
        const header = tableHeaders.find(h => h.originalIndex === i);
        
        if (header) {
          // If we have this header in our UI, use the value from the form
          fullRowData[i] = newPromo[header.id] || '';
        } else {
          // Any other hidden column gets an empty string
          // For delete column, set it to "No" for new promo
          fullRowData[i] = i === maxColumnIndex ? "No" : '';
        }
      }
      
      const formData = new FormData();
      formData.append('sheetName', sheetName);
      formData.append('rowData', JSON.stringify(fullRowData)); 
      formData.append('action', 'insert');

      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData  
      });
      
      console.log("Form submitted successfully");

      const newPromoWithId = {
        ...newPromo,
        _id: Math.random().toString(36).substring(2, 15)
      };
      
      setPromoList(prev => [newPromoWithId, ...prev]);
      
      setShowAddForm(false);
      
      // Reset form
      const emptyPromo = {};
      tableHeaders.forEach(header => {
        emptyPromo[header.id] = '';
      });
      
      setNewPromo(emptyPromo);
      
      setNotification({
        show: true,
        message: "Promo card added successfully!",
        type: "success"  
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error submitting new promo:", error);
      
      setNotification({
        show: true,
        message: `Failed to add promo card: ${error.message}`, 
        type: "error"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" }); 
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle clicking "Add Promo" button to open modal
  const handleAddPromoClick = () => {
    const emptyPromo = {};
    tableHeaders.forEach(header => {
      emptyPromo[header.id] = '';
    });
  
    // Auto-fill creation date
    const creationDateHeader = tableHeaders.find(header => 
      header.label.toLowerCase().includes('creation') || 
      header.label.toLowerCase().includes('created')
    );
    
    if (creationDateHeader) {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();
      emptyPromo[creationDateHeader.id] = `${day}/${month}/${year}`;
    }
  
    // Generate promo code
    const codeHeader = tableHeaders.find(header => 
      header.label.toLowerCase().includes('code') || 
      header.label.toLowerCase().includes('promo code')
    );
  
    if (codeHeader) {
      // Generate a random promo code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'PROMO';
      for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      emptyPromo[codeHeader.id] = result;
    }
  
    setNewPromo(emptyPromo);
    setShowAddForm(true);
  };

  // Handle editing a promo
  const handleEditPromo = (promo) => {
    setEditingPromoId(promo._id);
    setNewPromo({ ...promo });
    setShowEditForm(true);
  };

  // Handle updating a promo
  const handleUpdatePromo = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    
    try {
      const rowIndex = newPromo._rowIndex;
      
      if (!rowIndex) {
        throw new Error("Could not determine the row index for updating this promo");
      }
      
      // Create a full array of data for all columns, including the hidden delete column
      const fullRowData = [];
      
      // Loop through all possible column indexes and add data in the correct positions
      const maxColumnIndex = Math.max(...tableHeaders.map(h => h.originalIndex)) + 1;
      
      for (let i = 0; i < maxColumnIndex + 1; i++) {
        // Find the header for this column index (if it exists in our filtered headers)
        const header = tableHeaders.find(h => h.originalIndex === i);
        
        if (header) {
          // If we have this header in our UI, use the value from the form
          fullRowData[i] = newPromo[header.id] || '';
        } else {
          // Any other hidden column gets an empty string
          // For delete column, keep it as "No" during update
          fullRowData[i] = i === maxColumnIndex ? "No" : '';
        }
      }
      
      const formData = new FormData();
      formData.append('sheetName', sheetName);
      formData.append('rowData', JSON.stringify(fullRowData));
      formData.append('rowIndex', rowIndex);
      formData.append('action', 'update');
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        body: formData
      });
      
      console.log("Update submitted successfully");
      
      setPromoList(prev => 
        prev.map(promo => 
          promo._id === newPromo._id ? newPromo : promo  
        )
      );
      
      setEditingPromoId(null);
      setShowEditForm(false);
      
      setNotification({
        show: true,
        message: "Promo card updated successfully!",
        type: "success"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating promo:", error);
        
      setNotification({
        show: true,
        message: `Failed to update promo card: ${error.message}`,
        type: "error" 
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" }); 
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle initiating delete confirmation
  const handleDeleteClick = (promo) => {
    setPromoToDelete(promo);
    setShowDeleteModal(true);
  };

  // Handle confirming and soft-deleting a promo by marking delete column as "Yes"
  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      const promo = promoToDelete;
      const rowIndex = promo._rowIndex;
      
      if (!rowIndex) {
        throw new Error("Could not determine the row index for marking this promo as deleted");
      }
      
      // Find the delete column index
      const deleteColumnIndex = Math.max(...tableHeaders.map(h => h.originalIndex)) + 1;
      
      const formData = new FormData();
      formData.append('sheetName', sheetName);
      formData.append('rowIndex', rowIndex);
      formData.append('action', 'markDeleted');
      formData.append('columnIndex', deleteColumnIndex + 1); // +1 because Google Sheets is 1-indexed
      formData.append('value', 'Yes');
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        body: formData
      });
      
      console.log("Mark as deleted submitted successfully");
      
      // Update promo list state - remove from UI
      setPromoList(prev => prev.filter(p => p._id !== promo._id));
      
      setNotification({
        show: true,
        message: "Promo card removed successfully!",
        type: "success"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error marking promo as deleted:", error);
        
      setNotification({
        show: true,
        message: `Failed to remove promo card: ${error.message}`,
        type: "error" 
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setPromoToDelete(null);
    }
  };

  // Handle canceling delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPromoToDelete(null);
  };

  // Generate form field based on header type
  const renderFormField = (header, isEdit = false) => {
    const handleChange = isEdit ? handleInputChange : handleInputChange;
    const formData = isEdit ? newPromo : newPromo;
    
    // For date fields, provide a date picker
    if (header.label.toLowerCase().includes('date') || 
        header.label.toLowerCase().includes('expiry') || 
        header.label.toLowerCase().includes('valid')) {
      // Convert the date format (DD/MM/YYYY) to YYYY-MM-DD for the date input
      let dateValue = formData[header.id] || '';
      if (dateValue && dateValue.includes('/')) {
        const [day, month, year] = dateValue.split('/');
        dateValue = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return (
        <input
          type="date"
          id={`${isEdit ? 'edit-' : ''}${header.id}`}
          name={header.id}
          value={dateValue}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
      );
    }
    
    // For discount percentage fields
    if (header.label.toLowerCase().includes('discount') || 
        header.label.toLowerCase().includes('percent')) {
      return (
        <input
          type="number"
          id={`${isEdit ? 'edit-' : ''}${header.id}`}
          name={header.id}
          value={formData[header.id] || ''}
          onChange={handleChange}
          min="0"
          max="100"
          className="w-full p-2 border rounded-md"
        />
      );
    }
    
    // For description fields
    if (header.label.toLowerCase().includes('description')) {
      return (
        <textarea
          id={`${isEdit ? 'edit-' : ''}${header.id}`}
          name={header.id}
          value={formData[header.id] || ''}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded-md"
        />
      );
    }
    
    // Default to text input
    return (
      <input
        type="text"
        id={`${isEdit ? 'edit-' : ''}${header.id}`}
        name={header.id} 
        value={formData[header.id] || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded-md"
      />
    );
  };

  // Function to get a friendly column name for display
  const getColumnName = (header) => {
    // Map column IDs to friendly names if needed
    return header.label;
  };

  // Function to check if a promo is active based on dates
  const isPromoActive = (promo) => {
    // Find start date and end date headers
    const startDateHeader = tableHeaders.find(header => 
      header.label.toLowerCase().includes('start') || 
      header.label.toLowerCase().includes('valid from')
    );
    
    const endDateHeader = tableHeaders.find(header => 
      header.label.toLowerCase().includes('end') || 
      header.label.toLowerCase().includes('expiry') ||
      header.label.toLowerCase().includes('valid until')
    );
    
    if (!startDateHeader || !endDateHeader) return true; // If no date fields, assume active
    
    const startDateStr = promo[startDateHeader.id];
    const endDateStr = promo[endDateHeader.id];
    
    if (!startDateStr || !endDateStr) return true; // If dates not set, assume active
    
    // Parse DD/MM/YYYY format
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };
    
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    const today = new Date();
    
    return today >= startDate && today <= endDate;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Promo Cards</h2>
      
      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search promos..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-300"
          onClick={handleAddPromoClick}
        >
          <Plus size={18} />
          <span>Add Promo Card</span>
        </button>
      </div>
      
      {/* Active Promo Cards Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Active Promotions</h3>
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-orange-600">Loading promo data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
            {error} <button className="underline ml-2" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromos.filter(isPromoActive).length > 0 ? (
              filteredPromos.filter(isPromoActive).map(promo => {
                // Find relevant headers
                const codeHeader = tableHeaders.find(h => h.label.toLowerCase().includes('code'));
                const discountHeader = tableHeaders.find(h => h.label.toLowerCase().includes('discount'));
                const descriptionHeader = tableHeaders.find(h => h.label.toLowerCase().includes('description'));
                const expiryHeader = tableHeaders.find(h => h.label.toLowerCase().includes('expiry') || h.label.toLowerCase().includes('end'));
                
                return (
                  <div key={promo._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200 hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold">{codeHeader ? promo[codeHeader.id] : 'Promo'}</h4>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditPromo(promo)}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(promo)}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <Percent className="text-orange-500 mr-2" size={20} />
                        <span className="text-2xl font-bold text-orange-600">
                          {discountHeader ? promo[discountHeader.id] : '0'}%
                        </span>
                        <span className="ml-2 text-gray-600">discount</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {descriptionHeader ? promo[descriptionHeader.id] : 'No description available'}
                      </p>
                      {expiryHeader && promo[expiryHeader.id] && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1" size={14} />
                          <span>Expires: {promo[expiryHeader.id]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-orange-50 p-4 rounded-md text-orange-800 text-center">
                No active promotions found
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* All Promo Cards Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">All Promotions</h3>
        <div className="bg-white rounded-md shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-orange-600">Loading promo data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
              {error} <button className="underline ml-2" onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getColumnName(header)}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPromos.length > 0 ? (
                    filteredPromos.map((promo) => (
                      <tr key={promo._id} className={!isPromoActive(promo) ? "bg-gray-50" : ""}>
                        {/* Display mode row */}
                        {tableHeaders.map((header, index) => (
                          <td key={`display-${promo._id}-${header.id}`} className="px-6 py-4 whitespace-nowrap">
                            {index === 0 ? (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Tag className="text-orange-600" size={20} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{promo[header.id]}</div>
                                  {!isPromoActive(promo) && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">{promo[header.id]}</div>
                            )}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-orange-600 hover:text-orange-800 mr-3"
                            onClick={() => handleEditPromo(promo)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteClick(promo)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableHeaders.length + 1} className="px-6 py-4 text-center text-gray-500">
                        No promo cards found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding new promo */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-orange-800">Add New Promo Card</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddForm(false)}
                >
                  <X size={24} />
                </button>
              </div>
      
              <form onSubmit={handleAddPromo} className="space-y-6"> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tableHeaders.map((header) => (
                    <div key={header.id}>
                      <label htmlFor={header.id} className="block text-sm font-medium text-orange-700">
                        {getColumnName(header)}
                      </label>
                      {renderFormField(header)}  
                    </div>
                  ))}
                </div>
          
                <div className="flex justify-end space-x-3 pt-4 border-t border-orange-100">
                  <button
                    type="button"
                    className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>  
                        <Save size={18} className="mr-2" />
                        Save Promo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for editing promo */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-orange-800">Edit Promo Card</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPromoId(null);
                  }}
                >
                  <X size={24} />
                </button>
              </div>
      
              <form onSubmit={handleUpdatePromo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tableHeaders.map((header) => (
                    <div key={`edit-${header.id}`}>
                      <label htmlFor={`edit-${header.id}`} className="block text-sm font-medium text-orange-700">
                        {getColumnName(header)} 
                      </label>
                      {renderFormField(header, true)}
                    </div> 
                  ))}
                </div>
          
                <div className="flex justify-end space-x-3 pt-4 border-t border-orange-100">
                  <button
                    type="button"
                    className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPromoId(null);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button  
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Update Promo 
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>    
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this promo card? This action cannot be undone.
                {promoToDelete && (
                  <span className="font-medium block mt-2">
                    Promo Code: {promoToDelete[tableHeaders.find(h => h.label.toLowerCase().includes('code'))?.id]}
                  </span>
                )}
              </p>
        
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={cancelDelete}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                    <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete Promo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification popup */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
          notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"  
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default PromoCard;
