import React from "react";

const ModernRadioGroup = ({
  value,
  onChange,
  options = ["Yes", "No", "Sometimes", "N/A"],
  onCustomChange,
  name,
}) => {
  return (
    <div className="modern-radio-group">
      {options.map((option) => {
        const isChecked = value === option;
        return (
          <label
            key={option}
            className={`radio-label ${isChecked ? "radio-label-checked" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={isChecked}
              onChange={() => {
                onChange?.(option);
                onCustomChange?.(option);
              }}
              className="radio-input"
            />
            <span className="radio-text">{option}</span>
          </label>
        );
      })}
    </div>
  );
};

export default ModernRadioGroup;
