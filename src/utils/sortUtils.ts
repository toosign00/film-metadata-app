/**
 * 정렬 관련 유틸리티 함수
 */

/**
 * 자연어 정렬 함수
 * 파일 이름을 자연스러운 순서로 정렬 (1, 2, 10 대신 1, 2, ..., 10)
 * @param {File} a - 첫 번째 파일
 * @param {File} b - 두 번째 파일
 * @returns {number} 정렬 순서 (-1, 0, 1)
 */
export const naturalSort = (a: File, b: File): number => {
  const chunkify = (t: string): (string | number)[] => {
    const tz: string[] = [];
    let x = 0;
    let y = -1;
    let n = false;
    let i: number;
    let j: string;

    while (true) {
      j = t.charAt(x++);
      i = j.charCodeAt(0);
      if (!i) break;
      const m = i === 46 || (i >= 48 && i <= 57);
      if (m !== n) {
        tz[++y] = '';
        n = m;
      }
      tz[y] += j;
    }
    return tz.map((chunk) => (/^\d+$/.test(chunk) ? Number(chunk) : chunk));
  };

  const aa = chunkify(a.name.toLowerCase());
  const bb = chunkify(b.name.toLowerCase());

  for (let x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      if (typeof aa[x] === 'number' && typeof bb[x] === 'number') {
        return (aa[x] as number) - (bb[x] as number);
      }
      return String(aa[x]) > String(bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
};
