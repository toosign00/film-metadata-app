/**
 * 파일 정렬 관련 유틸리티 함수
 */

/**
 * 자연어 정렬 함수
 * 파일명을 문자열과 숫자를 구분하여 자연스러운 순서로 정렬
 * 예: file1.txt, file2.txt, file10.txt (사전식 정렬이 아닌 자연스러운 숫자 순서)
 * 
 * 알고리즘:
 * 1. 각 파일명을 숫자/문자 청크로 분할
 * 2. 청크 단위로 비교 (숫자는 수치로, 문자는 사전순으로)
 * 3. 첫 번째 다른 청크를 기준으로 정렬 순서 결정
 * 
 * @param {File} a - 비교할 첫 번째 파일
 * @param {File} b - 비교할 두 번째 파일  
 * @returns {number} 정렬 순서 (-1: a가 앞, 0: 동일, 1: b가 앞)
 */
export const naturalSort = (a: File, b: File): number => {
  /**
   * 문자열을 숫자/문자 청크로 분할하는 내부 함수
   * 예: "file10.txt" → ["file", 10, ".", "txt"]
   */
  const parseIntoChunks = (text: string): (string | number)[] => {
    const chunks: string[] = [];
    let charIndex = 0;
    let chunkIndex = -1;
    let isCurrentChunkNumeric = false;
    let charCode: number;
    let currentChar: string;

    // 문자열을 한 글자씩 순회하면서 청크 생성
    while (true) {
      currentChar = text.charAt(charIndex++);
      charCode = currentChar.charCodeAt(0);
      if (!charCode) break; // 문자열 끝에 도달
      
      const isCharNumeric = charCode >= 48 && charCode <= 57; // ASCII 코드로 숫자(0-9) 판별
      
      // 숫자/문자 타입이 바뀌면 새로운 청크 시작
      if (isCharNumeric !== isCurrentChunkNumeric) {
        chunks[++chunkIndex] = '';
        isCurrentChunkNumeric = isCharNumeric;
      }
      chunks[chunkIndex] += currentChar;
    }
    
    // 숫자로만 구성된 청크는 Number로 변환하여 반환
    return chunks.map((chunk) => (/^\d+$/.test(chunk) ? Number(chunk) : chunk));
  };

  // 각 파일명을 청크로 분할 (대소문자 구분 없이)
  const chunksA = parseIntoChunks(a.name.toLowerCase());
  const chunksB = parseIntoChunks(b.name.toLowerCase());

  // 청크별로 순차 비교
  for (let index = 0; chunksA[index] && chunksB[index]; index++) {
    if (chunksA[index] !== chunksB[index]) {
      // 둘 다 숫자인 경우: 수치로 비교
      if (typeof chunksA[index] === 'number' && typeof chunksB[index] === 'number') {
        return (chunksA[index] as number) - (chunksB[index] as number);
      }
      // 하나라도 문자인 경우: 문자열로 변환 후 사전순 비교
      return String(chunksA[index]) > String(chunksB[index]) ? 1 : -1;
    }
  }
  
  // 모든 청크가 동일한 경우: 청크 개수로 비교 (짧은 것이 앞)
  return chunksA.length - chunksB.length;
};
