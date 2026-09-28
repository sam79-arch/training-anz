/**
 * ============================================================================
 * 📦 LEETCODE #20: VALID PARENTHESES (EASY)
 * ============================================================================
 * Đề bài: Cho chuỗi `s` chỉ chứa các ký tự '(', ')', '{', '}', '[' và ']'.
 * Hãy xác định xem chuỗi đầu vào có hợp lệ hay không.
 *
 * Chuỗi đầu vào hợp lệ khi và chỉ khi:
 * 1. Các ngoặc mở phải được đóng bởi cùng loại ngoặc.
 * 2. Các ngoặc mở phải được đóng theo đúng thứ tự (LIFO - Last In First Out).
 * 3. Mỗi ngoặc đóng phải có một ngoặc mở tương ứng cùng loại.
 *
 * Target Complexity:
 * - Time Complexity: O(n) — Duyệt qua chuỗi đúng 1 lần duy nhất.
 * - Auxiliary Space: O(n) — Sử dụng cấu trúc dữ liệu Stack trong bộ nhớ.
 * ============================================================================
 */

// Bảng ánh xạ ngoặc đóng sang ngoặc mở tương ứng (O(1) lookup qua Map C++)
const MATCHING_PAIRS = new Map([
  [')', '('],
  ['}', '{'],
  [']', '['],
]);

/**
 * Kiểm tra tính hợp lệ của chuỗi dấu ngoặc
 * @param {string} s - Chuỗi đầu vào
 * @returns {boolean} - true nếu hợp lệ, false nếu không hợp lệ
 */
function isValid(s) {
  // 🛡️ GUARD CLAUSE DÒNG 1: Kiểm tra kiểu dữ liệu đầu vào
  if (typeof s !== 'string') return false;

  // 🛡️ GUARD CLAUSE DÒNG 2: Early exit trong O(1) nếu độ dài chuỗi lẻ
  // Một chuỗi có độ dài lẻ không bao giờ có thể tạo thành các cặp ngoặc hoàn chỉnh
  if (s.length % 2 !== 0) return false;

  // 🛡️ GUARD CLAUSE DÒNG 3: Chuỗi rỗng được quy ước là hợp lệ
  if (s.length === 0) return true;

  // Cấu trúc dữ liệu Stack (LIFO)
  const stack = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (MATCHING_PAIRS.has(char)) {
      // Gặp ngoặc đóng: Lấy phần tử đỉnh stack để đối chiếu
      const top = stack.pop();
      if (top !== MATCHING_PAIRS.get(char)) {
        return false; // Sai loại ngoặc hoặc stack rỗng (top === undefined)
      }
    } else {
      // Gặp ngoặc mở: Đẩy vào stack
      stack.push(char);
    }
  }

  // Kết thúc duyệt: Stack phải rỗng hoàn toàn (không còn ngoặc mở sót lại)
  return stack.length === 0;
}

module.exports = { isValid };
