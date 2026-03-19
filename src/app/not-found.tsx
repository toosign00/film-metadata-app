import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-[60vh] items-center justify-center p-6'>
      <div className='w-full max-w-lg rounded-xl border border-border bg-surface p-6 text-center shadow-md'>
        <h2 className='mb-2 font-bold text-foreground text-2xl'>페이지를 찾을 수 없습니다</h2>
        <p className='mb-6 text-foreground-muted'>
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href='/'
          className='inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover'
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}
