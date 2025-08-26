import React from 'react'

const EditableField = ({
  label,
  name,
  value,
  onChange,
  isEditing,
  type = 'text',
  rows,
  readOnly = false,
}) => {
  const baseClasses =
    'w-full px-3 py-2 border rounded-lg transition-colors text-sm'
  const editableClasses = `${baseClasses} bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`
  const readOnlyClasses = `${baseClasses} bg-gray-50 border-gray-200 text-gray-700`

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditing && !readOnly ? (
        rows ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className={editableClasses}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={editableClasses}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        )
      ) : (
        <div className={readOnlyClasses}>
          {value || `No ${label.toLowerCase()} provided`}
        </div>
      )}
    </div>
  )
}

export default EditableField
