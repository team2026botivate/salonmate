import { Award, Plus, X } from 'lucide-react'
import React, { useState } from 'react'

const SkillsSection = ({
  skills,
  isEditing,
  onAddSkill,
  onRemoveSkill,
}) => {
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onAddSkill(newSkill.trim())
      setNewSkill('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award size={20} className="mr-2 text-indigo-600" />
          Skills & Expertise
        </h3>

        {isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="group inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="ml-2 text-indigo-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new skill"
                className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                No skills added yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SkillsSection
