import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='grid min-h-[60vh] place-items-center p-6'>
      <section className='w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center'>
        <h1 className='text-2xl font-semibold text-foreground'>페이지를 찾지 못했어요</h1>
        <p className='mt-3 text-sm leading-7 text-foreground-muted'>
          주소가 바뀌었거나 존재하지 않는 페이지예요.
        </p>
        <Link
          href='/'
          className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
        >
          Film Metadata로 돌아가기
        </Link>
      </section>
    </main>
  );
}
