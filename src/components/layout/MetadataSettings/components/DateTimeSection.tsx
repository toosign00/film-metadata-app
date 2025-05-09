import React from 'react';
import CustomDatePicker from '../../../ui/CustomDatePicker';
import { MetadataSettings } from '../../../../config/constants';

interface ValidationErrors {
  startDate?: string;
  startTime?: string;
}

interface DateTimeSectionProps {
  settings: MetadataSettings;
  validationErrors: ValidationErrors;
  handleDateChange: (date: Date | null) => void;
  handleTimeChange: (time: Date | null) => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({ settings, validationErrors, handleDateChange, handleTimeChange }) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md" role="group" aria-labelledby="date-time-heading">
      <h3 id="date-time-heading" className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">
        촬영 날짜/시간
      </h3>

      <div className="mb-4 relative">
        <label htmlFor="startDate" className="block text-gray-300 font-medium mb-1 text-sm">
          날짜
        </label>
        <CustomDatePicker
          selected={settings.startDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="시작 날짜 선택"
          aria-describedby="startDate-help startDate-error"
          aria-required="true"
          aria-invalid={!!validationErrors.startDate}
          id="startDate"
          name="startDate"
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="startDate-help" className="mt-1 text-xs text-gray-500">
            첫 번째 사진의 촬영 날짜 (모든 사진에 동일하게 적용됩니다)
          </p>
          {validationErrors.startDate && (
            <p id="startDate-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.startDate}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <label htmlFor="startTime" className="block text-gray-300 font-medium mb-1 text-sm">
          시간
        </label>
        <CustomDatePicker
          selected={new Date(settings.startTime)}
          onChange={handleTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={1}
          timeFormat="HH:mm"
          dateFormat="HH:mm"
          placeholderText="시작 시간 선택"
          aria-describedby="startTime-help startTime-error"
          aria-required="true"
          aria-invalid={!!validationErrors.startTime}
          id="startTime"
          name="startTime"
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="startTime-help" className="mt-1 text-xs text-gray-500">
            첫 번째 사진의 촬영 시간 (사진 순서대로 1초 간격으로 설정됩니다)
          </p>
          {validationErrors.startTime && (
            <p id="startTime-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.startTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSection;
