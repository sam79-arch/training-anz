/**
 * ============================================================================
 * 📝 ĐỀ BÀI: VALID PALINDROME (LeetCode #125)
 * ============================================================================
 * Cho một chuỗi s, hãy kiểm tra xem chuỗi đó có phải là Palindrome (chuỗi đối xứng)
 * hay không, sau khi đã chuyển tất cả chữ hoa thành chữ thường và LOẠI BỎ TẤT CẢ
 * các ký tự không phải chữ cái và chữ số (alphanumeric).
 * 
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ (Data Platform):
 * - Time Complexity: O(n) duyệt mảng một lượt.
 * - Auxiliary Space: O(1) in-place pointers.
 * - TUYỆT ĐỐI TRÁNH: Regex replace toàn cục hay s.split('').reverse().join('')
 *   vì sẽ cấp phát chuỗi mới trong heap, gây quá tải Garbage Collector khi xử lý
 *   chuỗi hash/checksum ngân hàng kích thước lớn.
 * 
 * 📌 VÍ DỤ:
 * - "A man, a plan, a canal: Panama" -> true ("amanaplanacanalpanama")
 * - "race a car" -> false ("raceacar" !== "raceacar" ngược lại)
 * - "   " -> true (chuỗi rỗng sau khi bỏ ký tự đặc biệt)
 * 
 * 🔒 RÀNG BUỘC:
 * - 1 <= s.length <= 2 * 10^5
 * - s bao gồm các ký tự ASCII in được.
 * ============================================================================
 * 
 * @param {string} s - Chuỗi cần kiểm tra
 * @return {boolean} - true nếu là chuỗi đối xứng, ngược lại false
 */

/**
 * Helper: Kiểm tra ký tự chữ hoặc số cực kỳ trực quan.
 * Không cần nhớ số ASCII, không cần dùng Regex!
 * Trong JS: Có thể so sánh trực tiếp chữ cái từ 'a' đến 'z' và '0' đến '9'.
 * 
 * @param {string} char - Ký tự đơn lẻ
 * @return {boolean}
 */
function isAlphanumeric(char) {
  const c = char.toLowerCase();
  return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
}

function isPalindrome(s) {
  // 1. Guard Clauses: Kiểm tra nghiêm ngặt kiểu dữ liệu
  if (typeof s !== 'string') {
    return false;
  }
  if (s.length <= 1) {
    return true;
  }

  // 2. Kỹ thuật Two Pointers đối đầu (Left-Right Collision):
  // - left: bắt đầu từ đầu chuỗi (0)
  // - right: bắt đầu từ cuối chuỗi (s.length - 1)
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    // Bỏ qua các ký tự không phải chữ và số ở bên trái
    while (left < right && !isAlphanumeric(s[left])) {
      left++;
    }

    // Bỏ qua các ký tự không phải chữ và số ở bên phải
    while (left < right && !isAlphanumeric(s[right])) {
      right--;
    }

    // So sánh hai ký tự hợp lệ (không phân biệt hoa/thường)
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    // Tiến hai con trỏ lại gần nhau
    left++;
    right--;
  }

  return true;
}

module.exports = isPalindrome;

