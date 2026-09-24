/**
 * ============================================================================
 * 📝 ĐỀ BÀI: CONTAINER WITH MOST WATER (LeetCode #11 - Medium)
 * ============================================================================
 * Cho một mảng số nguyên dương `height` có độ dài `n`.
 * Mỗi phần tử `height[i]` đại diện cho một thanh đứng tại tọa độ (i, height[i]).
 * Tìm hai thanh bất kỳ cùng với trục hoành tạo thành một bình chứa nước sao cho
 * bình đó chứa được nhiều nước nhất.
 *
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ (Data Platform):
 * - Time Complexity: Tối ưu từ O(n²) vét cạn xuống O(n) tuyến tính.
 * - Auxiliary Space Complexity: O(1) in-place.
 * - Guard clause tại dòng 1: Kiểm tra mảng null, không phải mảng, hoặc độ dài < 2.
 * - Invariant: Chiều cao mặt nước bị giới hạn bởi thanh thấp hơn (Bottleneck).
 *   Cột thấp hơn thì dịch con trỏ vào trong để tìm cột cao hơn.
 * ============================================================================
 */

/**
 * Tìm dung tích chứa nước lớn nhất giữa hai thanh đứng bất kỳ
 * 
 * @param {number[]} height - Mảng chiều cao các thanh đứng
 * @return {number} - Diện tích / dung tích nước lớn nhất
 */
function maxArea(height) {
  // 1. Guard Clause tại dòng 1: Bắt buộc mảng hợp lệ và có ít nhất 2 thanh
  if (!Array.isArray(height) || height.length < 2) {
    return 0;
  }

  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  // 2. Kỹ thuật Two Pointers kẹp hai đầu O(n)
  while (left < right) {
    const width = right - left;
    const hL = height[left];
    const hR = height[right];

    // Chiều cao mặt nước bị giới hạn bởi thanh thấp hơn
    const minHeight = hL < hR ? hL : hR;
    const currentArea = width * minHeight;

    // Cập nhật diện tích lớn nhất ghi nhận được
    if (currentArea > maxWater) {
      maxWater = currentArea;
    }

    // Bất biến thuật toán:
    // Vì khoảng cách (width) luôn giảm sau mỗi bước, cơ hội duy nhất để tìm được
    // diện tích lớn hơn là tìm một cột mới cao hơn cột thấp hiện tại.
    // Do đó, ta luôn dịch chuyển con trỏ ở cột thấp hơn.
    if (hL < hR) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}

module.exports = {
  maxArea
};

