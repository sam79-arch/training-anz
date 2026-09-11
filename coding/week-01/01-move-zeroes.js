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
  // - nextIndex: vị trí con trỏ sẵn sàng ghi phần tử khác 0 tiếp theo
  // - currentIndex: con trỏ duyệt qua từng phần tử của mảng
  let nextIndex = 0;

  for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
    if (nums[currentIndex] !== 0) {
      // Chỉ hoán đổi/ghi đè khi 2 con trỏ ở 2 vị trí khác nhau
      if (currentIndex !== nextIndex) {
        nums[nextIndex] = nums[currentIndex];
        nums[currentIndex] = 0;
      }
      nextIndex++;
    }
  }

  return nums;
}

module.exports = moveZeroes;

