import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-900 p-6 text-gray-200'>
      <div className='w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6 text-center shadow-md'>
        <h2 className='mb-2 font-bold text-2xl'>페이지를 찾을 수 없습니다</h2>
        <p className='mb-6 text-gray-400'>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <Link
          href='/'
          className='inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}
