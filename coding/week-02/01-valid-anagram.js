/**
 * ============================================================================
 * 📝 ĐỀ BÀI 1: VALID ANAGRAM (LeetCode #242)
 * ============================================================================
 * Cho hai chuỗi `s` và `t`. Trả về `true` nếu `t` là một Anagram (đảo chữ) của `s`,
 * ngược lại trả về `false`.
 * Anagram là một từ hoặc cụm từ được tạo thành bằng cách sắp xếp lại các chữ cái
 * của một từ khác, sử dụng tất cả các chữ cái gốc đúng một lần.
 *
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ (Data Platform):
 * - Time Complexity: O(n) duyệt tuyến tính một lượt, không dùng sorting O(n log n).
 * - Space Complexity: O(1) auxiliary space sử dụng mảng tĩnh 26 chữ cái (Array Bucket).
 * - Line 1 Guard Clause: Bắt chặt chẽ kiểu dữ liệu và độ dài không khớp.
 *
 * ============================================================================
 * 📝 ĐỀ BÀI 2: GROUP ANAGRAMS (LeetCode #49 - Medium)
 * ============================================================================
 * Cho một mảng các chuỗi `strs`. Hãy gom nhóm các Anagram lại với nhau.
 * Kết quả có thể trả về theo bất kỳ thứ tự nào.
 *
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ:
 * - Time Complexity: O(N * K) với N là số lượng chuỗi, K là độ dài chuỗi dài nhất.
 * - Sử dụng Frequency Signature làm Key cho native Map thay vì Sort O(K log K).
 * - Bối cảnh ANZ: Gom cụm chữ ký giao dịch tương đồng (Transaction Pattern Grouping).
 * ============================================================================
 */

/**
 * Kiểm tra xem t có phải là anagram của s hay không
 * 
 * @param {string} s - Chuỗi thứ nhất
 * @param {string} t - Chuỗi thứ hai
 * @return {boolean} - true nếu là anagram, ngược lại false
 */
function isAnagram(s, t) {
  // 1. Guard Clause tại dòng 1: Kiểm tra tính hợp lệ của kiểu dữ liệu và độ dài
  if (typeof s !== 'string' || typeof t !== 'string' || s.length !== t.length) {
    return false;
  }

  // 2. Tối ưu O(1) Space: Mảng đếm tần suất 26 chữ cái tiếng Anh thường 'a'-'z'
  const counts = new Array(26).fill(0);
  const codeA = 97; // 'a'.charCodeAt(0)

  // 3. One-pass đếm: Tăng cho s và giảm cho t trong cùng một vòng lặp
  for (let i = 0; i < s.length; i++) {
    counts[s.charCodeAt(i) - codeA]++;
    counts[t.charCodeAt(i) - codeA]--;
  }

  // 4. Kiểm tra cân bằng: Nếu hai chuỗi là anagram, toàn bộ mảng counts phải bằng 0
  for (let i = 0; i < 26; i++) {
    if (counts[i] !== 0) {
      return false;
    }
  }

  return true;
}

/**
 * Tạo chuỗi chữ ký tần suất 26 ký tự dạng "#1#0#2...#0" trong O(K) thời gian
 * Tránh chi phí O(K log K) của thuật toán sắp xếp ký tự thông thường
 * 
 * @param {string} str - Chuỗi cần tạo chữ ký
 * @return {string} - Chữ ký tần suất duy nhất của chuỗi
 */
function getFrequencyKey(str) {
  const counts = new Array(26).fill(0);
  const codeA = 97;

  for (let i = 0; i < str.length; i++) {
    counts[str.charCodeAt(i) - codeA]++;
  }

  // Nối chuỗi chữ ký với dấu phân cách '#' để tránh nhập nhằng số (ví dụ '1' và '11')
  let key = '';
  for (let i = 0; i < 26; i++) {
    key += '#' + counts[i];
  }

  return key;
}

/**
 * Gom nhóm các chuỗi Anagram với nhau sử dụng Hash Map O(N * K)
 * 
 * @param {string[]} strs - Mảng các chuỗi cần gom nhóm
 * @return {string[][]} - Mảng các nhóm anagram
 */
function groupAnagrams(strs) {
  // 1. Guard Clause tại dòng 1: Kiểm tra mảng hợp lệ
  if (!Array.isArray(strs)) {
    return [];
  }
  if (strs.length === 0) {
    return [];
  }
  if (strs.length === 1) {
    return [[strs[0]]];
  }

  // 2. Khởi tạo native Map để gom nhóm
  // Key: Frequency Signature (#c0#c1...#c25), Value: mảng các chuỗi cùng signature
  const groupsMap = new Map();

  // 3. Duyệt qua N chuỗi, mỗi chuỗi tạo key trong O(K) thời gian
  for (let i = 0; i < strs.length; i++) {
    const str = strs[i];
    // Đảm bảo phần tử là chuỗi an toàn
    const safeStr = typeof str === 'string' ? str : String(str);
    const key = getFrequencyKey(safeStr);

    let group = groupsMap.get(key);
    if (!group) {
      group = [];
      groupsMap.set(key, group);
    }
    group.push(safeStr);
  }

  // 4. Trả về mảng các nhóm anagram
  return Array.from(groupsMap.values());
}

module.exports = {
  isAnagram,
  groupAnagrams
};

