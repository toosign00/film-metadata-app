export default function GlobalLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div
        className='h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'
        aria-label='로딩 중'
      />
    </div>
  );
}
