import { useState } from 'react';
import { FormSchema } from '../Form';

interface SummaryProps {
  data: FormSchema;
  stepTitles: Record<string, string>;
  fieldLabels: Record<string, string>;
  onConfirmChange: (confirmed: boolean) => void;
}

const Summary = ({ data, stepTitles, fieldLabels, onConfirmChange }: SummaryProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleCheckboxChange = () => {
    setIsConfirmed(!isConfirmed);
    onConfirmChange(!isConfirmed);
  };

  return (
    <>
      {Object.entries(data).map(([step, values]) => (
        <div key={step}>
          <span className='text-xl underline'>{stepTitles[step]}</span>
          {Object.entries(values)
            .filter(([field, value]) => typeof value !== 'boolean') // Exclude boolean values
            .map(([field, value]) => {
              const label = fieldLabels[`${step}.${field}`] || field;
              return (
                <p key={field}>
                  <span>{label}:</span> {value !== null && value !== undefined ? String(value) : 'N/A'}
                </p>
              );
            })}
        </div>
      ))}

      <div className='mt-5'>
        <label>
          <input
            type='checkbox'
            checked={isConfirmed}
            onChange={handleCheckboxChange}
          />
          I confirm
        </label>
      </div>
    </>
  );
};

export default Summary;
