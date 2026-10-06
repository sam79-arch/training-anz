/**
 * ============================================================================
 * 📦 MERGE TWO SORTED LISTS (LeetCode #21 - Easy)
 * ============================================================================
 * Kỹ thuật: Dummy Head Node & In-place Two-Pointer Splicing
 * Độ phức tạp:
 *   - Time Complexity: O(n + m) (duyệt tuyến tính qua tổng số nodes của cả 2 danh sách)
 *   - Auxiliary Space Complexity: O(1) (chỉ tạo 1 dummy node, toàn bộ thao tác trỏ in-place)
 *   - Call Stack Safety: Vòng lặp while thay vì đệ quy, triệt tiêu nguy cơ Call Stack Overflow
 * ============================================================================
 */

/**
 * Định nghĩa cấu trúc Node cho Singly Linked List
 */
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * Ghép 2 danh sách liên kết đơn đã sắp xếp thành 1 danh sách duy nhất theo thứ tự tăng dần
 * @param {ListNode|null} list1 - Đầu danh sách thứ nhất
 * @param {ListNode|null} list2 - Đầu danh sách thứ hai
 * @returns {ListNode|null} - Đầu của danh sách liên kết sau khi ghép
 */
function mergeTwoLists(list1, list2) {
  // Guard Clause tại Dòng 1: Kiểm tra trường hợp một trong hai danh sách là null/falsy
  if (!list1) return list2 || null;
  if (!list2) return list1;

  // Khởi tạo Dummy Head Node để đơn giản hóa việc quản lý con trỏ head
  const dummy = new ListNode(0);
  let tail = dummy;

  let p1 = list1;
  let p2 = list2;

  // Lặp so sánh giá trị tại 2 con trỏ, nối node nhỏ hơn vào tail
  while (p1 !== null && p2 !== null) {
    if (p1.val <= p2.val) {
      tail.next = p1;
      p1 = p1.next;
    } else {
      tail.next = p2;
      p2 = p2.next;
    }
    tail = tail.next;
  }

  // Nối phần còn lại của danh sách chưa duyệt hết trong O(1)
  tail.next = p1 !== null ? p1 : p2;

  return dummy.next;
}

/**
 * Helper: Chuyển đổi mảng số thành Linked List
 * @param {number[]} arr - Mảng số đầu vào
 * @returns {ListNode|null} - Head của danh sách liên kết
 */
function arrayToList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const dummy = new ListNode(0);
  let curr = dummy;
  for (let i = 0; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return dummy.next;
}

/**
 * Helper: Chuyển đổi Linked List thành mảng số
 * @param {ListNode|null} head - Head của danh sách liên kết
 * @returns {number[]} - Mảng các giá trị
 */
function listToArray(head) {
  const result = [];
  let curr = head;
  while (curr !== null) {
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
}

module.exports = {
  ListNode,
  mergeTwoLists,
  arrayToList,
  listToArray
};

