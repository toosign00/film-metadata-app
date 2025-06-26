import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { CustomInputProps, CustomDatePickerProps } from '@/types/customDatePicker.type';

export const CustomDatePicker = ({
  selected,
  onChange,
  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeFormat = 'HH:mm',
  dateFormat = 'yyyy-MM-dd',
  placeholderText,
  disabled = false,
  id,
  name,
  ...rest
}: CustomDatePickerProps) => {
  // 커스텀 입력 컴포넌트
  const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({ value, onClick, placeholder, disabled, id, name }, ref) => (
      <div className="relative" onClick={onClick}>
        <input
          ref={ref}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          id={id}
          name={name}
          className="w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-800 py-2.5 pr-10 pl-4 text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          readOnly={true}
          style={{ caretColor: 'transparent' }}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {showTimeSelectOnly ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
      </div>
    ),
  );

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      customInput={<CustomInput />}
      showTimeSelect={showTimeSelect}
      showTimeSelectOnly={showTimeSelectOnly}
      timeFormat={timeFormat}
      timeIntervals={15}
      timeCaption="시간"
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      disabled={disabled}
      locale={ko}
      popperClassName="react-datepicker-dark"
      {...rest}
    />
  );
};
