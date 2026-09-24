/**
 * ============================================================================
 * 🎯 LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS (LeetCode #3 - Medium)
 * ============================================================================
 * Target: HCLTech x ANZ Bank Backend Interview (Data Platform Team)
 * Pattern: Dynamic Sliding Window + Hash Map Last-Seen Index
 *
 * 🏦 Banking Problem Scenario (ANZ Liquidity & Session Monitoring):
 * Hệ thống API Gateway của ngân hàng ANZ cần giám sát chuỗi Token giao dịch
 * gửi lên từ thiết bị khách hàng theo thời gian thực. Để ngăn chặn tấn công
 * Replay Attack hoặc Session Hijacking, hệ thống phải xác định độ dài lớn nhất
 * của chuỗi token liên tục không chứa bất kỳ định danh trùng lặp nào.
 *
 * 💡 Kỹ thuật cốt lõi (Sliding Window Jump Optimization):
 * - Dùng 2 con trỏ `left` và `right` để tạo thành một cửa sổ trượt linh hoạt `[left, right]`.
 * - Lưu vị trí xuất hiện gần nhất của từng ký tự vào Map: `charIndexMap.set(char, right)`.
 * - Khi gặp ký tự đã xuất hiện trong cửa sổ hiện tại:
 *     left = Math.max(left, charIndexMap.get(char) + 1);
 *   Lưu ý: Bắt buộc dùng `Math.max` để tránh bẫy nhảy lùi con trỏ (ví dụ chuỗi "abba"),
 *   vì ký tự trùng lặp có thể nằm trước vị trí hiện tại của `left`.
 * - Cập nhật độ dài tối đa tại mỗi bước:
 *     maxLength = Math.max(maxLength, right - left + 1);
 *
 * ⏱️ Độ phức tạp:
 * - Time Complexity: O(n) — Mỗi ký tự chỉ được duyệt qua đúng một lần bởi con trỏ `right`.
 *   Con trỏ `left` nhảy tức thời trong O(1).
 * - Auxiliary Space: O(min(m, n)) — m là kích thước bảng ký tự (m <= 128 với ASCII),
 *   n là độ dài chuỗi s.
 * ============================================================================
 */

/**
 * Tìm độ dài chuỗi con dài nhất không chứa ký tự lặp lại.
 *
 * @param {string} s - Chuỗi đầu vào cần kiểm tra
 * @returns {number} - Độ dài chuỗi con dài nhất không trùng lặp
 */
function lengthOfLongestSubstring(s) {
  // 🚨 Guard Clause tại dòng 1: Kiểm tra tính hợp lệ của dữ liệu đầu vào
  if (s === null || s === undefined || typeof s !== 'string') {
    return 0;
  }

  // Tối ưu hóa sớm cho các trường hợp biên nhỏ
  if (s.length <= 1) {
    return s.length;
  }

  let maxLength = 0;
  let left = 0;

  // Sử dụng native Map để lưu vị trí chỉ mục xuất hiện gần nhất của từng ký tự
  // Tránh prototype pollution và hidden class deopt của Plain Object
  const charIndexMap = new Map();

  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];

    // Nếu ký tự hiện tại đã từng xuất hiện trước đó
    if (charIndexMap.has(currentChar)) {
      const lastSeenIndex = charIndexMap.get(currentChar);
      // Bẫy sống còn (Critical Invariant):
      // Chỉ dịch chuyển `left` nếu vị trí cũ nằm TRONG hoặc SAU cửa sổ hiện tại (`>= left`).
      // Dùng Math.max để đảm bảo con trỏ `left` không bao giờ bị nhảy lùi về quá khứ!
      left = Math.max(left, lastSeenIndex + 1);
    }

    // Cập nhật vị trí mới nhất của ký tự hiện tại
    charIndexMap.set(currentChar, right);

    // Kích thước của cửa sổ hiện tại là (right - left + 1)
    const currentWindowLength = right - left + 1;
    if (currentWindowLength > maxLength) {
      maxLength = currentWindowLength;
    }
  }

  return maxLength;
}

module.exports = {
  lengthOfLongestSubstring,
};

