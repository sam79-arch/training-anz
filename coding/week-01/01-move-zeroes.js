/**
 * Bài toán: Move Zeroes (LeetCode #283)
 * Phân loại: Mảng & Hai con trỏ (Two Pointers - Write / Read pointers)
 * 
 * Mục tiêu phỏng vấn ANZ:
 * - Đảm bảo in-place mutation với O(1) auxiliary space.
 * - Chạy trong O(n) time complexity với 1 vòng lặp duy nhất.
 * - Guard clause xử lý chặt chẽ edge cases ngay tại dòng đầu tiên.
 * - Tuyệt đối KHÔNG dùng splice() hoặc unshift() gây suy thoái O(n^2).
 * 
 * @param {number[]} nums - Mảng số nguyên đầu vào
 * @return {number[]} - Trả về chính reference của mảng sau khi dồn số 0 về cuối
 */
function moveZeroes(nums) {
  // 1. Guard Clauses: Kiểm tra nghiêm ngặt trường hợp biên
  if (!nums || !Array.isArray(nums) || nums.length <= 1) {
    return nums;
  }

  // 2. Kỹ thuật Two Pointers:
  // - writeIndex: vị trí con trỏ sẵn sàng ghi phần tử khác 0 tiếp theo
  // - readIndex: con trỏ duyệt qua từng phần tử của mảng
  let writeIndex = 0;

  for (let readIndex = 0; readIndex < nums.length; readIndex++) {
    if (nums[readIndex] !== 0) {
      // Chỉ hoán đổi/ghi đè khi 2 con trỏ ở 2 vị trí khác nhau
      if (readIndex !== writeIndex) {
        nums[writeIndex] = nums[readIndex];
        nums[readIndex] = 0;
      }
      writeIndex++;
    }
  }

  return nums;
}

module.exports = moveZeroes;

