import type { StepNavigationProps } from '@/types/step-navigation.type';

export const StepNavigation = ({
  activeStep,
  goToStep,
  filesCount,
  resultsCount,
  resetForm,
}: StepNavigationProps) => {
  return (
    <nav className='sticky top-0 z-10 border-b border-gray-700 bg-gray-800 px-4 py-3 shadow-md'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex items-center justify-between'>
          <div className='flex w-full space-x-1'>
            <button
              type='button'
              onClick={() => goToStep(1)}
              className={`flex-1 rounded-l-lg px-2 py-2 text-sm font-medium transition-all ${
                activeStep === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className='hidden md:inline'>1. 파일 선택</span>
              <span className='md:hidden'>파일</span>
              {filesCount > 0 && (
                <span className='bg-opacity-30 ml-1 rounded-full bg-black px-1.5 py-0.5 text-xs text-white md:text-sm'>
                  {filesCount}
                </span>
              )}
            </button>

            <button
              type='button'
              onClick={() => goToStep(2)}
              disabled={filesCount === 0}
              className={`flex-1 px-2 py-2 text-sm font-medium transition-all ${
                activeStep === 2
                  ? 'bg-blue-600 text-white'
                  : filesCount === 0
                    ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className='hidden md:inline'>2. 메타데이터 설정</span>
              <span className='md:hidden'>설정</span>
            </button>

            <button
              type='button'
              onClick={() => goToStep(3)}
              disabled={resultsCount === 0}
              className={`flex-1 rounded-r-lg px-2 py-2 text-sm font-medium transition-all ${
                activeStep === 3
                  ? 'bg-blue-600 text-white'
                  : resultsCount === 0
                    ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className='hidden md:inline'>3. 결과 확인</span>
              <span className='md:hidden'>결과</span>
              {resultsCount > 0 && (
                <span className='bg-opacity-30 ml-1 rounded-full bg-black px-1.5 py-0.5 text-xs text-white md:text-sm'>
                  {resultsCount}
                </span>
              )}
            </button>
          </div>

          <button
            type='button'
            onClick={resetForm}
            className='ml-2 text-sm text-gray-400 transition-colors hover:text-red-400'
            title='모두 초기화'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
              role='img'
            >
              <title>초기화 아이콘</title>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
