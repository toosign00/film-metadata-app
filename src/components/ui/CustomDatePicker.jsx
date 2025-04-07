import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

/**
 * 커스텀 데이트피커 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Date} props.selected - 선택된 날짜/시간
 * @param {Function} props.onChange - 변경 이벤트 핸들러
 * @param {Boolean} props.showTimeSelect - 시간 선택 표시 여부
 * @param {Boolean} props.showTimeSelectOnly - 시간만 선택 여부
 * @param {String} props.timeFormat - 시간 포맷 ("HH:mm")
 * @param {Object} props.dateFormat - 날짜 포맷 ("yyyy-MM-dd")
 * @param {String} props.placeholderText - 플레이스홀더 텍스트
 * @param {Boolean} props.disabled - 비활성화 여부
 */
const CustomDatePicker = ({
  selected,
  onChange,
  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeFormat = 'HH:mm',
  dateFormat = 'yyyy-MM-dd',
  placeholderText,
  disabled = false,
  ...rest
}) => {
  // 커스텀 입력 컴포넌트
  const CustomInput = forwardRef(({ value, onClick, placeholder, disabled }, ref) => (
    <div className="relative" onClick={onClick}>
      <input
        ref={ref}
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-4 pr-10 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm cursor-pointer"
        readOnly={true}
        style={{ caretColor: 'transparent' }}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {showTimeSelectOnly ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  ));

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
      popperPlacement="top-auto"
      {...rest}
    />
  );
};

export default CustomDatePicker;
