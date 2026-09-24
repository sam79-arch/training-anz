/**
 * ============================================================================
 * 📝 ĐỀ BÀI: 3SUM (LeetCode #15 - Medium)
 * ============================================================================
 * Cho một mảng số nguyên `nums`. Hãy tìm tất cả các bộ ba `[nums[i], nums[j], nums[k]]`
 * sao cho:
 * 1. i != j, i != k, và j != k (3 phần tử ở 3 vị trí chỉ mục khác nhau)
 * 2. nums[i] + nums[j] + nums[k] === 0
 * 3. Tập hợp kết quả KHÔNG được chứa các bộ ba trùng lặp (No duplicate triplets).
 *
 * ⚠️ YÊU CẦU PHỎNG VẤN ANZ (Data Platform):
 * - Time Complexity: Tối ưu từ O(n³) xuống O(n²) bằng Two Pointers kẹp hai đầu.
 * - Auxiliary Space Complexity: O(1) in-place (không tính mảng kết quả).
 * - Bẫy trùng lặp (Skip Duplicates): Tuyệt đối không dùng `Set` chuyển đổi chuỗi
 *   để lọc trùng (tốn RAM và chậm), mà phải nhảy cóc con trỏ trực tiếp.
 * - Guard clause tại dòng 1 bắt chặt chẽ mảng null, rỗng, hoặc độ dài < 3.
 * ============================================================================
 */

/**
 * Tìm tất cả các bộ ba không trùng lặp có tổng bằng 0
 * 
 * @param {number[]} nums - Mảng số nguyên đầu vào
 * @return {number[][]} - Danh sách các bộ ba thỏa mãn điều kiện
 */
function threeSum(nums) {
  // 1. Guard Clause tại dòng 1: Kiểm tra tính hợp lệ của mảng đầu vào
  if (!Array.isArray(nums) || nums.length < 3) {
    return [];
  }

  // 2. Sắp xếp mảng số học tăng dần O(n log n)
  // Tạo bản sao shallow copy để tránh gây side-effect đột biến mảng gốc của caller
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const result = [];

  // 3. Early-Exit: Nếu phần tử nhỏ nhất lớn hơn 0, tổng 3 số dương không thể bằng 0
  if (sorted[0] > 0) {
    return [];
  }

  // 4. Vòng lặp ngoài cố định phần tử thứ nhất: sorted[i]
  for (let i = 0; i < n - 2; i++) {
    // Ngắt sớm vòng lặp: Nếu phần tử cố định > 0, các số phía sau đều > 0
    if (sorted[i] > 0) {
      break;
    }

    // Skip duplicate cho con trỏ i: Nếu số hiện tại bằng số trước đó, bỏ qua để tránh trùng bộ ba
    if (i > 0 && sorted[i] === sorted[i - 1]) {
      continue;
    }

    // 5. Khởi tạo Two Pointers kẹp hai đầu cho mảng con còn lại: [i + 1 ... n - 1]
    let left = i + 1;
    let right = n - 1;

    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];

      if (sum === 0) {
        // Tìm thấy bộ ba hợp lệ
        result.push([sorted[i], sorted[left], sorted[right]]);

        // Skip duplicates cho con trỏ left
        while (left < right && sorted[left] === sorted[left + 1]) {
          left++;
        }
        // Skip duplicates cho con trỏ right
        while (left < right && sorted[right] === sorted[right - 1]) {
          right--;
        }

        // Tiến cả 2 con trỏ vào trong để tiếp tục tìm kiếm cặp khác
        left++;
        right--;
      } else if (sum < 0) {
        // Tổng đang âm (thiếu) -> Tăng con trỏ left để lấy số lớn hơn
        left++;
      } else {
        // Tổng đang dương (thừa) -> Giảm con trỏ right để lấy số nhỏ hơn
        right--;
      }
    }
  }

  return result;
}

module.exports = {
  threeSum
};

