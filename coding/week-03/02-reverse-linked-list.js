/**
 * ============================================================================
 * 📦 REVERSE LINKED LIST (LeetCode #206 - Easy)
 * ============================================================================
 * Kỹ thuật: Sliding 3-Pointer In-place Traversal (prev, curr, next)
 * Độ phức tạp:
 *   - Time Complexity: O(n) (1 vòng lặp tuyến tính duy nhất qua n nodes)
 *   - Auxiliary Space Complexity: O(1) (tái sử dụng nguyên vẹn các node trên heap)
 *   - Memory Safety: Không sử dụng đệ quy, triệt tiêu nguy cơ Call Stack Overflow
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
 * Đảo ngược danh sách liên kết đơn in-place bằng kỹ thuật 3 con trỏ
 * @param {ListNode|null} head - Đầu danh sách liên kết
 * @returns {ListNode|null} - Đầu mới của danh sách sau khi đảo ngược
 */
function reverseList(head) {
  // Guard clause tại Dòng 1: Kiểm tra null, undefined, non-object hoặc list 1 node
  if (!head || typeof head !== 'object' || !head.next) return head;

  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // 1. Lưu lại tham chiếu node kế tiếp trước khi bẻ gãy liên kết
    curr.next = prev;       // 2. Đảo ngược liên kết của node hiện thời trỏ về node trước
    prev = curr;            // 3. Tịnh tiến con trỏ prev lên vị trí curr
    curr = next;            // 4. Tịnh tiến con trỏ curr lên vị trí next
  }

  return prev; // Khi curr là null, prev chính là head mới của danh sách đảo ngược
}

/**
 * Helper: Chuyển đổi mảng JavaScript thành Singly Linked List
 * @param {Array} arr - Mảng giá trị
 * @returns {ListNode|null}
 */
function arrayToList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let curr = head;
  for (let i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return head;
}

/**
 * Helper: Chuyển đổi Singly Linked List thành mảng JavaScript để kiểm thử
 * @param {ListNode|null} head - Đầu danh sách
 * @returns {Array}
 */
function listToArray(head) {
  if (!head || typeof head !== 'object') return [];
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
  reverseList,
  arrayToList,
  listToArray,
};
