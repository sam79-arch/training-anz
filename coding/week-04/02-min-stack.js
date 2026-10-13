/**
 * ============================================================================
 * 📦 MIN STACK (LeetCode #155 - Medium) (Week 4 Day 3)
 * ============================================================================
 * Kỹ thuật: Two Parallel Stacks (Mảng chính & Mảng lưu trữ Minimum)
 * Độ phức tạp:
 *   - Time Complexity: O(1) cho TẤT CẢ các thao tác (push, pop, top, getMin)
 *   - Space Complexity: O(n) (trong trường hợp xấu nhất dãy đơn điệu giảm dần)
 *   - Invariant Cốt Lõi: Đẩy vào minStack khi `val <= currentMin` để bắt trọn
 *     các giá trị min trùng lặp (Duplicate Min Trap).
 * ============================================================================
 */

class MinStack {
  constructor() {
    this.items = [];
    this.minStack = [];
  }

  /**
   * Đẩy một số nguyên vào đỉnh stack
   * @param {number} val - Giá trị số cần đẩy
   */
  push(val) {
    // Guard clause tại Dòng 1: Kiểm tra tính hợp lệ của kiểu dữ liệu
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new TypeError(`MinStack.push requires a valid number, received: ${val}`);
    }

    this.items.push(val);

    // Invariant: val <= currentMin (dùng dấu <= thay vì < để xử lý trùng lặp min)
    if (
      this.minStack.length === 0 ||
      val <= this.minStack[this.minStack.length - 1]
    ) {
      this.minStack.push(val);
    }
  }

  /**
   * Rút phần tử ở đỉnh stack và trả về giá trị đó
   * @returns {number|undefined}
   */
  pop() {
    // Guard clause tại Dòng 1: Kiểm tra stack rỗng
    if (this.items.length === 0) {
      return undefined;
    }

    const popped = this.items.pop();

    // Nếu phần tử bị pop đúng bằng min hiện tại, pop luôn khỏi minStack
    if (popped === this.minStack[this.minStack.length - 1]) {
      this.minStack.pop();
    }

    return popped;
  }

  /**
   * Lấy giá trị của phần tử ở đỉnh stack mà không xóa
   * @returns {number|undefined}
   */
  top() {
    // Guard clause tại Dòng 1: Kiểm tra stack rỗng
    if (this.items.length === 0) {
      return undefined;
    }

    return this.items[this.items.length - 1];
  }

  /**
   * Truy xuất phần tử nhỏ nhất trong stack trong thời gian O(1)
   * @returns {number|undefined}
   */
  getMin() {
    // Guard clause tại Dòng 1: Kiểm tra minStack rỗng
    if (this.minStack.length === 0) {
      return undefined;
    }

    return this.minStack[this.minStack.length - 1];
  }

  /**
   * Lấy kích thước hiện tại của stack
   * @returns {number}
   */
  size() {
    return this.items.length;
  }
}

module.exports = {
  MinStack
};

