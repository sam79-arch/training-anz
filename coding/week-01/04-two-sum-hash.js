/**
 * ============================================================================
 * 📝 ĐỀ BÀI 1: TWO SUM (LeetCode #1)
 * ============================================================================
 * Cho một mảng số nguyên CHƯA SẮP XẾP `nums` và một số nguyên `target`.
 * Hãy tìm 2 chỉ mục (0-based index) của 2 phần tử có tổng bằng đúng `target`.
 * 
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ (Data Platform):
 * - Time Complexity: O(n) duyệt mảng đúng 1 lượt (One-Pass Hash Table).
 * - Space Complexity: O(n) sử dụng native `new Map()` trong Node.js.
 * - Bảo toàn chỉ mục gốc (original index), không dùng Two Pointers vì làm đảo lộn mảng.
 * 
 * 📌 BỐI CẢNH THỰC TẾ TẠI ANZ BANK:
 * - Đối soát giao dịch hai chiều (Offsetting Transactions): Tìm cặp giao dịch Ghi Nợ /
 *   Ghi Có khớp đúng số tiền target để tất toán cân bằng sổ cái tài chính.
 * 
 * ============================================================================
 * 📝 ĐỀ BÀI 2: CONTAINS DUPLICATE (LeetCode #217)
 * ============================================================================
 * Cho một mảng số nguyên `nums`. Trả về `true` nếu có bất kỳ giá trị nào xuất hiện
 * ít nhất hai lần trong mảng, ngược lại trả về `false`.
 * 
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ:
 * - Cơ chế ngắt sớm (Early-Exit) ngay khi phát hiện phần tử trùng lặp.
 * - Ứng dụng kiểm soát Idempotency Key / Request ID chống trừ tiền 2 lần (Double-charging).
 * ============================================================================
 */

/**
 * Tìm 2 chỉ mục có tổng bằng target sử dụng One-Pass Hash Map
 * 
 * @param {number[]} nums - Mảng số nguyên chưa sắp xếp
 * @param {number} target - Tổng cần tìm
 * @return {number[]} - Mảng 2 chỉ mục [index1, index2]
 */
function twoSum(nums, target) {
  // 1. Guard Clause: Kiểm tra mảng hợp lệ và đủ ít nhất 2 phần tử
  if (!Array.isArray(nums) || nums.length < 2) {
    return [];
  }

  // 2. Khởi tạo Hash Map để lưu trữ: Key = giá trị phần tử, Value = chỉ mục ban đầu
  const numMap = new Map();

  // 3. One-Pass Loop: Vừa duyệt vừa tra cứu phần bù (complement)
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // Tra cứu trong O(1) time
    if (numMap.has(complement)) {
      return [numMap.get(complement), i];
    }

    // Lưu phần tử hiện tại vào Map để phục vụ các phần tử phía sau tra cứu
    numMap.set(nums[i], i);
  }

  // Trường hợp không tìm thấy cặp thỏa mãn
  return [];
}

/**
 * Kiểm tra mảng có chứa phần tử trùng lặp hay không với cơ chế Early-Exit
 * 
 * @param {number[]} nums - Mảng số nguyên cần kiểm tra
 * @return {boolean} - true nếu có trùng lặp, false nếu toàn bộ độc nhất
 */
function containsDuplicate(nums) {
  // 1. Guard Clause: Mảng không hợp lệ hoặc <= 1 phần tử thì không thể có trùng lặp
  if (!Array.isArray(nums) || nums.length <= 1) {
    return false;
  }

  // 2. Sử dụng native Set để lưu trữ các giá trị đã gặp
  const seen = new Set();

  // 3. Early-Exit Loop: Ngắt ngay lập tức khi phát hiện duplicate
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) {
      return true; // Thoát sớm trong O(1) lookup time
    }
    seen.add(nums[i]);
  }

  return false;
}

module.exports = {
  twoSum,
  containsDuplicate
};

