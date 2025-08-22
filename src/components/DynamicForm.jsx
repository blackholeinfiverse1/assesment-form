import React, { useState, useEffect } from "react";
import { FIELD_TYPES } from "../lib/formConfigService";

// Individual field components
const TextField = ({ field, value, onChange, error }) => (
  <div>
    <label className="label">
      {field.label}{" "}
      {field.required && <span className="text-orange-300">*</span>}
    </label>
    {field.helpText && <div className="help">{field.helpText}</div>}
    <input
      type={field.type}
      name={field.id}
      value={value || ""}
      onChange={onChange}
      required={field.required}
      placeholder={field.placeholder}
      className={`input ${error ? "border-red-400" : ""}`}
      min={field.validation?.min}
      max={field.validation?.max}
      minLength={field.validation?.minLength}
      maxLength={field.validation?.maxLength}
      pattern={field.validation?.pattern}
    />
    {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
  </div>
);

const TextAreaField = ({ field, value, onChange, error }) => (
  <div>
    <label className="label">
      {field.label}{" "}
      {field.required && <span className="text-orange-300">*</span>}
    </label>
    {field.helpText && <div className="help">{field.helpText}</div>}
    <textarea
      name={field.id}
      value={value || ""}
      onChange={onChange}
      required={field.required}
      placeholder={field.placeholder}
      className={`input min-h-[100px] ${error ? "border-red-400" : ""}`}
      minLength={field.validation?.minLength}
      maxLength={field.validation?.maxLength}
    />
    {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
  </div>
);

const SelectField = ({ field, value, onChange, error }) => (
  <div>
    <label className="label">
      {field.label}{" "}
      {field.required && <span className="text-orange-300">*</span>}
    </label>
    {field.helpText && <div className="help">{field.helpText}</div>}
    <select
      name={field.id}
      value={value || ""}
      onChange={onChange}
      required={field.required}
      className={`input ${error ? "border-red-400" : ""}`}
    >
      <option value="">{field.placeholder || "Select an option"}</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
  </div>
);

const RadioField = ({ field, value, onChange, error }) => (
  <div>
    <label className="label">
      {field.label}{" "}
      {field.required && <span className="text-orange-300">*</span>}
    </label>
    {field.helpText && <div className="help">{field.helpText}</div>}
    <div className="space-y-3">
      {field.options?.map((option) => (
        <label
          key={option.value}
          className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
            value === option.value
              ? 'border-orange-400 bg-orange-500/20 text-white shadow-lg'
              : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/30'
          }`}
        >
          <input
            type="radio"
            name={field.id}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            required={field.required}
            className="sr-only"
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </div>
    {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
  </div>
);

const CheckboxField = ({ field, value, onChange, error }) => {
  // Handle both checkbox and multi-select field types with checkbox UI
  const isMultiSelect = field.type === FIELD_TYPES.MULTI_SELECT;
  
  return (
    <div>
      <label className="label">
        {field.label}{" "}
        {field.required && <span className="text-orange-300">*</span>}
      </label>
      {field.helpText && <div className="help">{field.helpText}</div>}
      <div className="space-y-3 pl-4">
        {field.options?.map((option) => {
          const isChecked = Array.isArray(value)
            ? value.includes(option.value)
            : false;
          return (
            <label
              key={option.value}
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                isChecked
                  ? 'border-orange-400 bg-orange-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <input
                type="checkbox"
                name={field.id}
                value={option.value}
                checked={isChecked}
                onChange={(e) => {
                  const currentValues = Array.isArray(value) ? value : [];
                  const newValues = e.target.checked
                    ? [...currentValues, option.value]
                    : currentValues.filter((v) => v !== option.value);
                  
                  onChange({ target: { name: field.id, value: newValues } });
                }}
                className="absolute opacity-0 w-0 h-0"
              />
              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all flex-shrink-0 ${
                isChecked
                  ? 'border-orange-400 bg-orange-500'
                  : 'border-white/30 bg-transparent'
              }`}>
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-left flex-1">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
    </div>
  );
};

const MultiSelectField = ({ field, value, onChange, error }) => (
  <div>
    <label className="label">
      {field.label}{" "}
      {field.required && <span className="text-orange-300">*</span>}
    </label>
    {field.helpText && <div className="help">{field.helpText}</div>}
    <select
      name={field.id}
      multiple
      value={Array.isArray(value) ? value : []}
      onChange={(e) => {
        const selectedValues = Array.from(
          e.target.selectedOptions,
          (option) => option.value
        );
        onChange({ target: { name: field.id, value: selectedValues } });
      }}
      required={field.required}
      className={`input min-h-[120px] ${error ? "border-red-400" : ""}`}
    >
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <div className="text-xs text-white/60 mt-1">
      Hold Ctrl/Cmd to select multiple options
    </div>
    {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
  </div>
);

// Main dynamic form component
export default function DynamicForm({
  config,
  formData,
  onChange,
  onSubmit,
  loading = false,
  errors = {},
  submitButtonText = "Submit",
  resetButtonText = "Reset",
  onReset,
}) {
  const [localErrors, setLocalErrors] = useState({});

  // Sort fields by order
  const sortedFields = config?.fields
    ? [...config.fields].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });

    // Clear field error when user starts typing
    if (localErrors[name]) {
      setLocalErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateField = (field, value) => {
    const fieldErrors = [];

    if (
      field.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      fieldErrors.push(`${field.label} is required`);
    }

    if (value && field.validation) {
      const validation = field.validation;

      if (validation.minLength && value.length < validation.minLength) {
        fieldErrors.push(
          `${field.label} must be at least ${validation.minLength} characters`
        );
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        fieldErrors.push(
          `${field.label} must be no more than ${validation.maxLength} characters`
        );
      }

      if (validation.min && Number(value) < validation.min) {
        fieldErrors.push(`${field.label} must be at least ${validation.min}`);
      }

      if (validation.max && Number(value) > validation.max) {
        fieldErrors.push(
          `${field.label} must be no more than ${validation.max}`
        );
      }

      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        fieldErrors.push(`${field.label} format is invalid`);
      }
    }

    return fieldErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    sortedFields.forEach((field) => {
      const fieldErrors = validateField(field, formData[field.id]);
      if (fieldErrors.length > 0) {
        newErrors[field.id] = fieldErrors[0]; // Show first error
      }
    });

    setLocalErrors(newErrors);

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      onSubmit(e);
    }
  };

  const renderField = (field) => {
    const value = formData[field.id];
    const error = errors[field.id] || localErrors[field.id];

    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.EMAIL:
      case FIELD_TYPES.NUMBER:
        return (
          <TextField
            key={field.id}
            field={field}
            value={value}
            onChange={handleFieldChange}
            error={error}
          />
        );

      case FIELD_TYPES.TEXTAREA:
        return (
          <TextAreaField
            key={field.id}
            field={field}
            value={value}
            onChange={handleFieldChange}
            error={error}
          />
        );

      case FIELD_TYPES.SELECT:
        return (
          <SelectField
            key={field.id}
            field={field}
            value={value}
            onChange={handleFieldChange}
            error={error}
          />
        );

      case FIELD_TYPES.RADIO:
        return (
          <RadioField
            key={field.id}
            field={field}
            value={value}
            onChange={handleFieldChange}
            error={error}
          />
        );

      case FIELD_TYPES.CHECKBOX:
        return (
          <CheckboxField
            key={field.id}
            field={field}
            value={value}
            onChange={handleFieldChange}
            error={error}
          />
        );

      case FIELD_TYPES.MULTI_SELECT:
        // For specific fields that should have checkbox-style UI instead of dropdown
        if (field.id === 'programming_languages' || field.id === 'preferred_learning_tools') {
          return (
            <CheckboxField
              key={field.id}
              field={field}
              value={value}
              onChange={handleFieldChange}
              error={error}
            />
          );
        }
        // Default multi-select (dropdown style)
        return (
          <MultiSelectField
            key={field.id}
            field={field}
            value={value}
            onChange={handleFieldChange}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  if (!config || !config.fields) {
    return (
      <div className="text-white/70">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
          <p>Loading form configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sortedFields.map((field) => (
        <div key={field.id}>{renderField(field)}</div>
      ))}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
        {onReset && (
          <button type="button" onClick={onReset} className="btn hover:scale-105 transition-all duration-200">
            {resetButtonText}
          </button>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary hover:scale-105 transition-all duration-200 disabled:hover:scale-100">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
}
