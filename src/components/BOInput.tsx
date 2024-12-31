import React from 'react';
import { IMaskInput } from 'react-imask';

interface BOInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const BOInput: React.FC<BOInputProps> = ({ value, onChange, required }) => {
  return (
    <div className="w-full">
      <IMaskInput
        className="bo-input"
        mask={[
          { mask: '' },
          { mask: 'aa0000/00' }
        ]}
        definitions={{
          'a': /[A-Za-z]/,
          '0': /[0-9]/
        }}
        value={value}
        unmask={false}
        onAccept={(value) => onChange(value.toUpperCase())}
        placeholder="AB1234/25"
        title="Formato: AB1234/25"
        required={required}
      />
    </div>
  );
};