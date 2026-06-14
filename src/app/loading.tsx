export default function GlobalLoading() {
  return (
    <div
      className='flex min-h-screen items-center justify-center'
      role='status'
      aria-label='화면을 불러오고 있어요'
    >
      <div
        className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'
        aria-hidden='true'
      />
    </div>
  );
}
