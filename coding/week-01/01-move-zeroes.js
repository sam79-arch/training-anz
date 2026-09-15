/**
 * ============================================================================
 * 📝 ĐỀ BÀI: MOVE ZEROES (LeetCode #283)
 * ============================================================================
 * Cho một mảng số nguyên nums. Hãy di chuyển tất cả các số 0 về cuối mảng trong
 * khi vẫn GIỮ NGUYÊN THỨ TỰ TƯƠNG ĐỐI của các phần tử khác 0.
 * 
 * ⚠️ YÊU CẦU BẮT BUỘC:
 * - Thao tác In-Place: Sửa đổi trực tiếp trên mảng gốc, O(1) Auxiliary Space.
 * - Hiệu năng: O(n) Time Complexity với đúng 1 vòng lặp duy nhất.
 * - Cấm dùng splice(), unshift() (bẫy O(n^2)) hoặc filter(), spread [...] (bẫy O(n) RAM).
 * 
 * 📌 VÍ DỤ MINH HỌA:
 * - Ví dụ 1: nums = [0, 1, 0, 3, 12]  -->  Output: [1, 3, 12, 0, 0]
 * - Ví dụ 2: nums = [0]                -->  Output: [0]
 * - Ví dụ 3: nums = [-1, 0, 0, -2, 5]  -->  Output: [-1, -2, 5, 0, 0]
 * - Ví dụ 4: nums = [1, 2, 3, 4]       -->  Output: [1, 2, 3, 4] (Tránh redundant write)
 * 
 * 🔒 RÀNG BUỘC:
 * - 0 <= nums.length <= 10^5 (Xử lý an toàn null, undefined, mảng rỗng)
 * - -2^31 <= nums[i] <= 2^31 - 1
 * ============================================================================
 * 
 * @param {number[]} nums - Mảng số nguyên đầu vào
 * @return {number[]} - Trả về chính reference của mảng sau khi dồn số 0 về cuối
 */
function moveZeroes(nums) {
  // 1. Guard Clause: Kiểm tra trường hợp biên (Fail-fast)
  if (!nums || !Array.isArray(nums) || nums.length <= 1) {
    return nums;
  }

  // 2. Kỹ thuật Two Pointers (Tư duy "Chuyển chỗ ngồi"):
  // - writeIndex: Vị trí ghế trống ở ĐẦU mảng, sẵn sàng đón phần tử khác 0
  // - readIndex:  Đi quét tìm phần tử KHÁC 0 từ đầu đến cuối mảng
  let writeIndex = 0;

  for (let readIndex = 0; readIndex < nums.length; readIndex++) {
    // Khi tìm thấy đứa KHÁC 0:
    if (nums[readIndex] !== 0) {
      // Chuyển nó về ghế đầu (chỉ chuyển khi chưa ngồi đúng chỗ)
      if (readIndex !== writeIndex) {
        nums[writeIndex] = nums[readIndex]; // Ghế đầu nhận người
        nums[readIndex] = 0;               // Ghế cũ bỏ lại biến thành số 0
      }
      writeIndex++; // Chuẩn bị ghế tiếp theo ở phía trước
    }
  }

  return nums;
}

module.exports = moveZeroes;

