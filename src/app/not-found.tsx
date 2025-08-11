import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6'>
      <div className='w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-md text-center'>
        <h2 className='text-2xl font-bold mb-2'>페이지를 찾을 수 없습니다</h2>
        <p className='text-gray-400 mb-6'>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <Link
          href='/'
          className='inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2'
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}
