import { ko } from 'date-fns/locale';
import { Calendar, Clock4 } from 'lucide-react';
import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import type { CustomDatePickerProps, CustomInputProps } from '@/types/customDatePicker.type';

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>((props, forwardedRef) => {
  const { value, onClick, placeholder, disabled, id, name, showTimeSelectOnly } = props;
  const inputRef = forwardedRef;
  return (
    <button
      type='button'
      className='relative w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-800 py-2.5 pr-10 pl-4 text-left text-gray-200 shadow-sm transition-colors hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
        className='w-full cursor-pointer border-none bg-transparent outline-none'
        readOnly={true}
        style={{ caretColor: 'transparent' }}
      />
      {/* 아이콘 */}
      <div className='absolute inset-y-0 right-0 flex w-10 items-center justify-center'>
        {showTimeSelectOnly ? (
          <Clock4 className='text-gray-500' size={20} />
        ) : (
          <Calendar className='text-gray-500' size={20} />
        )}
      </div>
    </button>
  );
});

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
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      customInput={<CustomInput showTimeSelectOnly={showTimeSelectOnly} id={id} name={name} />}
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
      id={id}
      name={name}
      {...rest}
    />
  );
};
