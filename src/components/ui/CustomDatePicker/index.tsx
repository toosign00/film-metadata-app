import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Calendar, Clock4 } from 'lucide-react';
import type { CustomDatePickerProps, CustomInputProps } from '@/types/customDatePicker.type';

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
  const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>((props, forwardedRef) => {
    const { value, onClick, placeholder, disabled, id, name, showTimeSelectOnly } = props;
    const inputRef = forwardedRef;
    return (
      <button
        type='button'
        className='relative w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-800 py-2.5 pr-10 pl-4 text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-600 transition-colors text-left'
        onClick={onClick}
        disabled={disabled}
      >
        <input
          ref={inputRef}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          id={id}
          name={name}
          className='w-full bg-transparent border-none outline-none cursor-pointer'
          readOnly={true}
          style={{ caretColor: 'transparent' }}
        />
        {/* 아이콘 */}
        <div className='absolute inset-y-0 right-0 flex items-center justify-center w-10'>
          {showTimeSelectOnly ? (
            <Clock4 className='text-gray-500' size={20} />
          ) : (
            <Calendar className='text-gray-500' size={20} />
          )}
        </div>
      </button>
    );
  });

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      customInput={<CustomInput showTimeSelectOnly={showTimeSelectOnly} />}
      showTimeSelect={showTimeSelect}
      showTimeSelectOnly={showTimeSelectOnly}
      timeFormat={timeFormat}
      timeIntervals={15}
      timeCaption='시간'
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      disabled={disabled}
      locale={ko}
      popperClassName='react-datepicker-dark'
      {...rest}
    />
  );
};
