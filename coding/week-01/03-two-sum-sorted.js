/**
 * ============================================================================
 * 📝 ĐỀ BÀI: TWO SUM II - INPUT ARRAY IS SORTED (LeetCode #167)
 * ============================================================================
 * Cho một mảng số nguyên 1-indexed `numbers` ĐÃ ĐƯỢC SẮP XẾP TĂNG DẦN và một số `target`.
 * Hãy tìm 2 chỉ mục (1-based index) của 2 số có tổng bằng đúng `target`.
 * 
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ (Data Platform):
 * - Time Complexity: O(n) duyệt mảng tối đa 1 lượt.
 * - Auxiliary Space: O(1) in-place pointers (TUYỆT ĐỐI KHÔNG dùng Hash Map O(n) bộ nhớ).
 * - Trả về mảng 2 phần tử [index1, index2] với 1 <= index1 < index2 <= numbers.length.
 * 
 * 📌 BỐI CẢNH THỰC TẾ TẠI ANZ BANK:
 * - Khớp cặp giao dịch đối ứng (Transaction Reconciliation): Tìm 2 khoản tiền bù trừ
 *   khớp đúng số tiền target để tất toán giao dịch.
 * 
 * 📌 VÍ DỤ:
 * - numbers = [2, 7, 11, 15], target = 9 -> [1, 2] (vì 2 + 7 = 9)
 * - numbers = [2, 3, 4], target = 6      -> [1, 3] (vì 2 + 4 = 6)
 * - numbers = [-1, 0], target = -1       -> [1, 2] (vì -1 + 0 = -1)
 * 
 * 🔒 RÀNG BUỘC:
 * - 2 <= numbers.length <= 3 * 10^4
 * - -1000 <= numbers[i] <= 1000
 * - numbers được sắp xếp theo thứ tự không giảm (non-decreasing).
 * - Luôn tồn tại duy nhất một nghiệm hợp lệ.
 * ============================================================================
 * 
 * @param {number[]} numbers - Mảng số nguyên đã sắp xếp tăng dần
 * @param {number} target - Tổng cần tìm
 * @return {number[]} - Mảng 2 chỉ mục theo chuẩn 1-indexed [index1, index2]
 */
function twoSumSorted(numbers, target) {
  // 1. Guard Clause: Kiểm tra tính hợp lệ của mảng đầu vào
  if (!Array.isArray(numbers) || numbers.length < 2) {
    return [];
  }

  // 2. Kỹ thuật Two Pointers đối đầu (Left-Right Collision):
  // - left: trỏ vào phần tử nhỏ nhất (đầu mảng)
  // - right: trỏ vào phần tử lớn nhất (cuối mảng)
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      // LeetCode #167 quy ước 1-based indexing: cộng thêm 1 cho cả hai chỉ số
      return [left + 1, right + 1];
    } else if (sum < target) {
      // Tổng hiện tại nhỏ hơn target -> cần số lớn hơn -> dịch con trỏ trái sang phải
      left++;
    } else {
      // Tổng hiện tại lớn hơn target -> cần số nhỏ hơn -> dịch con trỏ phải sang trái
      right--;
    }
  }

  // Trường hợp không tìm thấy cặp thỏa mãn
  return [];
}

module.exports = twoSumSorted;

