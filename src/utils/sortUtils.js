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
export const naturalSort = (a, b) => {
  const chunkify = (t) => {
    const tz = [];
    let x = 0,
      y = -1,
      n = 0,
      i,
      j;

    while ((i = (j = t.charAt(x++)).charCodeAt(0))) {
      const m = i === 46 || (i >= 48 && i <= 57);
      if (m !== n) {
        tz[++y] = '';
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  };

  const aa = chunkify(a.name.toLowerCase());
  const bb = chunkify(b.name.toLowerCase());

  for (let x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      const c = Number(aa[x]),
        d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else {
        return aa[x] > bb[x] ? 1 : -1;
      }
    }
  }
  return aa.length - bb.length;
};
