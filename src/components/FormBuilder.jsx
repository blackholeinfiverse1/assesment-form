import React, { useState, useEffect } from 'react'
import { FIELD_TYPES, FormConfigService } from '../lib/formConfigService'

const FieldEditor = ({ field, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localField, setLocalField] = useState(field)

  useEffect(() => {
    setLocalField(field)
  }, [field])

  const handleChange = (key, value) => {
    const updatedField = { ...localField, [key]: value }
    setLocalField(updatedField)
    onUpdate(updatedField)
  }

  const handleOptionChange = (index, key, value) => {
    const newOptions = [...(localField.options || [])]
    newOptions[index] = { ...newOptions[index], [key]: value }
    handleChange('options', newOptions)
  }

  const addOption = () => {
    const newOptions = [...(localField.options || []), { value: '', label: '' }]
    handleChange('options', newOptions)
  }

  const removeOption = (index) => {
    const newOptions = localField.options?.filter((_, i) => i !== index) || []
    handleChange('options', newOptions)
  }

  const needsOptions = [FIELD_TYPES.SELECT, FIELD_TYPES.RADIO, FIELD_TYPES.CHECKBOX, FIELD_TYPES.MULTI_SELECT].includes(localField.type)

  return (
    <div className="border border-white/20 rounded-lg p-4 bg-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-400 hover:text-orange-300"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="font-medium text-white">
            {localField.label || 'Untitled Field'} ({localField.type})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="btn-sm disabled:opacity-50"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="btn-sm disabled:opacity-50"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            className="btn-sm bg-red-500 hover:bg-red-600"
            title="Delete field"
          >
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Field ID</label>
              <input
                type="text"
                value={localField.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className="input"
                placeholder="field_id"
              />
            </div>
            <div>
              <label className="label">Field Type</label>
              <select
                value={localField.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="input"
              >
                {Object.entries(FIELD_TYPES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Label</label>
            <input
              type="text"
              value={localField.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="input"
              placeholder="Field Label"
            />
          </div>

          <div>
            <label className="label">Placeholder</label>
            <input
              type="text"
              value={localField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="input"
              placeholder="Placeholder text"
            />
          </div>

          <div>
            <label className="label">Help Text</label>
            <input
              type="text"
              value={localField.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              className="input"
              placeholder="Additional help text"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localField.required || false}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="text-orange-500"
              />
              <span className="text-white/90">Required</span>
            </label>
          </div>

          {needsOptions && (
            <div>
              <label className="label">Options</label>
              <div className="space-y-2">
                {localField.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      className="input flex-1"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                      className="input flex-1"
                      placeholder="Label"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="btn-sm bg-red-500 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="btn-sm bg-green-500 hover:bg-green-600"
                >
                  Add Option
                </button>
              </div>
            </div>
          )}

          {(localField.type === FIELD_TYPES.TEXT || localField.type === FIELD_TYPES.TEXTAREA || localField.type === FIELD_TYPES.NUMBER) && (
            <div>
              <label className="label">Validation</label>
              <div className="grid grid-cols-2 gap-4">
                {localField.type === FIELD_TYPES.NUMBER && (
                  <>
                    <div>
                      <label className="text-sm text-white/70">Min Value</label>
                      <input
                        type="number"
                        value={localField.validation?.min || ''}
                        onChange={(e) => handleChange('validation', { ...localField.validation, min: e.target.value ? Number(e.target.value) : undefined })}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Max Value</label>
                      <input
                        type="number"
                        value={localField.validation?.max || ''}
                        onChange={(e) => handleChange('validation', { ...localField.validation, max: e.target.value ? Number(e.target.value) : undefined })}
                        className="input"
                        placeholder="100"
                      />
                    </div>
                  </>
                )}
                {(localField.type === FIELD_TYPES.TEXT || localField.type === FIELD_TYPES.TEXTAREA) && (
                  <>
                    <div>
                      <label className="text-sm text-white/70">Min Length</label>
                      <input
                        type="number"
                        value={localField.validation?.minLength || ''}
                        onChange={(e) => handleChange('validation', { ...localField.validation, minLength: e.target.value ? Number(e.target.value) : undefined })}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Max Length</label>
                      <input
                        type="number"
                        value={localField.validation?.maxLength || ''}
                        onChange={(e) => handleChange('validation', { ...localField.validation, maxLength: e.target.value ? Number(e.target.value) : undefined })}
                        className="input"
                        placeholder="255"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FormBuilder({ onSave, onCancel, initialConfig = null }) {
  const [config, setConfig] = useState(initialConfig || {
    name: 'New Form Configuration',
    description: 'Custom form configuration',
    fields: []
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: FIELD_TYPES.TEXT,
      label: 'New Field',
      placeholder: '',
      required: false,
      order: config.fields.length + 1
    }
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (index, updatedField) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? updatedField : field)
    }))
  }

  const deleteField = (index) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const moveField = (index, direction) => {
    const newFields = [...config.fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
      
      // Update order values
      newFields.forEach((field, i) => {
        field.order = i + 1
      })
      
      setConfig(prev => ({ ...prev, fields: newFields }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors([])

    // Validate configuration
    const validationErrors = FormConfigService.validateFormConfig(config)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setSaving(false)
      return
    }

    try {
      const savedConfig = await FormConfigService.saveFormConfig({
        ...config,
        id: config.id || `config_${Date.now()}`
      })
      onSave(savedConfig)
    } catch (error) {
      setErrors([error.message || 'Failed to save configuration'])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Form Configuration</h3>
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-400/30 rounded-md">
            <div className="text-red-200 text-sm">
              <div className="font-medium mb-1">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label">Form Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Form Name"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              placeholder="Form description"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-white">Form Fields</h4>
          <button
            onClick={addField}
            className="btn btn-primary"
          >
            Add Field
          </button>
        </div>

        <div className="space-y-4">
          {config.fields.map((field, index) => (
            <FieldEditor
              key={field.id || index}
              field={field}
              onUpdate={(updatedField) => updateField(index, updatedField)}
              onDelete={() => deleteField(index)}
              onMoveUp={() => moveField(index, 'up')}
              onMoveDown={() => moveField(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < config.fields.length - 1}
            />
          ))}
          
          {config.fields.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No fields added yet. Click "Add Field" to get started.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/20">
        <button
          onClick={onCancel}
          className="btn"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}
