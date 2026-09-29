/**
 * ============================================================================
 * 🌳 B+TREE STORAGE ENGINE & COVERING INDEX SIMULATION (Week 3 Day 2)
 * ============================================================================
 * Mô phỏng kiến trúc B+Tree trong hệ quản trị cơ sở dữ liệu quan hệ (PostgreSQL / MySQL)
 * phục vụ phân tích hiệu năng truy vấn cho ANZ Data Platform.
 *
 * CÁC ĐẶC TÍNH KIẾN TRÚC:
 * 1. B+Tree Node: Tách biệt rõ ràng Internal Node (chỉ chứa khóa điều hướng) và
 *    Leaf Node (chứa khóa, con trỏ Table Heap tuple, và payload cột INCLUDE).
 * 2. Doubly Linked List at Leaf Level: Tầng lá liên kết 2 chiều (prev / next),
 *    cho phép quét phạm vi (Range Scan) không cần duyệt ngược lại từ Root.
 * 3. TableHeap: Quản lý các trang dữ liệu bảng vật lý (8KB/16KB pages),
 *    mô phỏng định dạng tuple pointer (pageId, slotId).
 * 4. Bookmark Lookup Penalty: Đo lường chi phí Random Heap I/O khi truy vấn
 *    cột không nằm trong Secondary Index.
 * 5. Covering Index (Index-Only Scan): Tối ưu hóa triệt tiêu 100% Heap Reads
 *    bằng mệnh đề INCLUDE.
 *
 * Tiêu chuẩn mã nguồn: Native Node.js, Guard Clause dòng 1, Zero external dependencies.
 * ============================================================================
 */

let globalPageIdSequence = 1;

/**
 * Lớp đại diện cho một nút lá trong cây B+Tree (Leaf Page)
 */
class BPlusTreeLeafNode {
  constructor(maxEntries = 16) {
    if (!Number.isInteger(maxEntries) || maxEntries < 2) {
      throw new TypeError('maxEntries must be an integer >= 2');
    }
    this.isLeaf = true;
    this.maxEntries = maxEntries;
    this.entries = []; // Array of { key, tuplePointer, payload }
    this.prev = null;
    this.next = null;
    this.parent = null;
    this.pageId = globalPageIdSequence++;
  }

  isFull() {
    if (!Array.isArray(this.entries)) return false;
    return this.entries.length >= this.maxEntries;
  }
}

/**
 * Lớp đại diện cho một nút nội bộ trong cây B+Tree (Internal / Index Router Page)
 */
class BPlusTreeNode {
  constructor(maxChildren = 16) {
    if (!Number.isInteger(maxChildren) || maxChildren < 2) {
      throw new TypeError('maxChildren must be an integer >= 2');
    }
    this.isLeaf = false;
    this.maxChildren = maxChildren;
    this.keys = []; // Array of separator keys
    this.children = []; // Array of child nodes (BPlusTreeNode or BPlusTreeLeafNode)
    this.parent = null;
    this.pageId = globalPageIdSequence++;
  }

  isFull() {
    if (!Array.isArray(this.children)) return false;
    return this.children.length >= this.maxChildren;
  }
}

/**
 * Lớp cài đặt động cơ chỉ mục B+Tree (B+Tree Index Engine)
 */
class BPlusTreeIndex {
  constructor({
    name = 'idx_default',
    columns = ['id'],
    fanout = 16,
    includeColumns = [],
    table = null,
  } = {}) {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new TypeError('Index must specify at least one indexed column');
    }

    this.name = name;
    this.columns = [...columns];
    this.fanout = Math.max(fanout, 3);
    this.includeColumns = Array.isArray(includeColumns) ? [...includeColumns] : [];
    this.table = table;
    this.root = new BPlusTreeLeafNode(this.fanout);
    this.height = 1;
    this.totalEntries = 0;
  }

  /**
   * Tính toán chiều cao hiện tại của cây B+Tree (Root đến Leaf)
   * @returns {number}
   */
  getHeight() {
    if (!this.root) return 0;
    let h = 0;
    let curr = this.root;
    while (curr) {
      h++;
      if (curr.isLeaf) break;
      curr = curr.children[0];
    }
    return h;
  }

  /**
   * Kiểm tra xem chỉ mục có bao phủ toàn bộ các cột cần truy vấn không
   * @param {string[]} requiredColumns
   * @returns {boolean}
   */
  isCovering(requiredColumns) {
    if (!Array.isArray(requiredColumns) || requiredColumns.length === 0) {
      return true;
    }
    const coveredSet = new Set([...this.columns, ...this.includeColumns]);
    for (const col of requiredColumns) {
      if (!coveredSet.has(col)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Chèn bản ghi vào B+Tree
   * @param {Object} row
   * @param {Object} tuplePointer
   */
  insert(row, tuplePointer) {
    if (!row || typeof row !== 'object') {
      throw new TypeError('Row must be a valid object');
    }

    const key = row[this.columns[0]];
    const payload = {};
    for (const col of this.columns) {
      payload[col] = row[col];
    }
    for (const col of this.includeColumns) {
      payload[col] = row[col];
    }

    const entry = {
      key,
      tuplePointer: tuplePointer ? { ...tuplePointer } : null,
      payload,
    };

    // Tìm leaf node đích
    const leaf = this._findLeaf(key);
    this._insertIntoLeaf(leaf, entry);
    this.totalEntries++;
  }

  /**
   * Tìm kiếm điểm (Point Lookup) theo khóa
   * @param {number|string} searchKey
   * @returns {Object} { found, row, indexPagesRead, heapPagesRead }
   */
  pointLookup(searchKey) {
    if (searchKey === null || searchKey === undefined) {
      return { found: false, row: null, indexPagesRead: 0, heapPagesRead: 0 };
    }

    let indexPagesRead = 0;
    let curr = this.root;

    // Duyệt qua các tầng Internal Nodes
    while (!curr.isLeaf) {
      indexPagesRead++;
      const childIdx = this._findChildIndex(curr.keys, searchKey);
      curr = curr.children[childIdx];
    }

    // Đọc tầng Leaf Node
    indexPagesRead++;
    const leaf = curr;
    let matchedEntry = null;

    for (let i = 0; i < leaf.entries.length; i++) {
      if (leaf.entries[i].key === searchKey) {
        matchedEntry = leaf.entries[i];
        break;
      }
    }

    if (!matchedEntry) {
      return { found: false, row: null, indexPagesRead, heapPagesRead: 0 };
    }

    // Nếu có Table Heap và cần lấy đầy đủ dữ liệu hàng
    if (this.table && matchedEntry.tuplePointer) {
      const fullRow = this.table.getRow(
        matchedEntry.tuplePointer.pageId,
        matchedEntry.tuplePointer.slotId
      );
      return {
        found: true,
        row: fullRow,
        indexPagesRead,
        heapPagesRead: 1,
      };
    }

    return {
      found: true,
      row: matchedEntry.payload,
      indexPagesRead,
      heapPagesRead: 0,
    };
  }

  /**
   * Quét phạm vi (Range Scan) sử dụng liên kết kép leaf.next
   * @param {Object} options
   * @returns {Object} { rows, leafPagesTraversed, indexPagesRead, heapPagesRead }
   */
  rangeScan({ from, to, requiredColumns = [] } = {}) {
    if (from === null || from === undefined || to === null || to === undefined || to < from) {
      return { rows: [], leafPagesTraversed: 0, indexPagesRead: 0, heapPagesRead: 0 };
    }

    let indexPagesRead = 0;
    let curr = this.root;

    // Duyệt từ Root xuống Leaf đầu tiên thỏa mãn >= from
    while (!curr.isLeaf) {
      indexPagesRead++;
      const childIdx = this._findChildIndex(curr.keys, from);
      curr = curr.children[childIdx];
    }

    // Đọc Leaf Node đầu tiên
    indexPagesRead++;
    let leafPagesTraversed = 1;
    let leaf = curr;
    const rows = [];
    let heapPagesRead = 0;
    const isCovered = this.isCovering(requiredColumns);

    let finished = false;
    while (leaf && !finished) {
      for (let i = 0; i < leaf.entries.length; i++) {
        const entry = leaf.entries[i];
        if (entry.key > to) {
          finished = true;
          break;
        }
        if (entry.key >= from) {
          let rowData;
          if (isCovered) {
            rowData = { ...entry.payload };
          } else if (this.table && entry.tuplePointer) {
            heapPagesRead++;
            rowData = this.table.getRow(
              entry.tuplePointer.pageId,
              entry.tuplePointer.slotId
            );
          } else {
            rowData = { ...entry.payload };
          }
          rows.push(rowData);
        }
      }

      if (!finished) {
        if (leaf.next) {
          leaf = leaf.next;
          leafPagesTraversed++;
          indexPagesRead++;
        } else {
          break;
        }
      }
    }

    return {
      rows,
      leafPagesTraversed,
      indexPagesRead,
      heapPagesRead,
    };
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  _findLeaf(key) {
    if (key === null || key === undefined) return this.root;
    let curr = this.root;
    while (!curr.isLeaf) {
      const idx = this._findChildIndex(curr.keys, key);
      curr = curr.children[idx];
    }
    return curr;
  }

  _findChildIndex(keys, targetKey) {
    if (!Array.isArray(keys) || keys.length === 0) return 0;
    let low = 0;
    let high = keys.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      if (keys[mid] <= targetKey) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result + 1;
  }

  _insertIntoLeaf(leaf, entry) {
    if (!leaf || !entry) return;

    let insertPos = 0;
    while (insertPos < leaf.entries.length && leaf.entries[insertPos].key < entry.key) {
      insertPos++;
    }
    leaf.entries.splice(insertPos, 0, entry);

    // Kiểm tra nếu Leaf tràn trang (Overflow)
    if (leaf.entries.length > leaf.maxEntries) {
      this._splitLeaf(leaf);
    }
  }

  _splitLeaf(leaf) {
    if (!leaf) return;

    const newLeaf = new BPlusTreeLeafNode(leaf.maxEntries);
    let splitIndex;

    // Tối ưu hóa phân rã trang cho tuần tự (Sequential Insert Optimization)
    // Giống cơ chế BTR_MODIFY_LEAF trong InnoDB / PostgreSQL btree
    const isSequentialAppend =
      leaf.entries.length > 2 &&
      leaf.entries[leaf.entries.length - 1].key > leaf.entries[leaf.entries.length - 2].key;

    if (isSequentialAppend) {
      splitIndex = leaf.maxEntries;
    } else {
      splitIndex = Math.floor(leaf.entries.length / 2);
    }

    newLeaf.entries = leaf.entries.splice(splitIndex);
    newLeaf.next = leaf.next;
    newLeaf.prev = leaf;
    if (leaf.next) {
      leaf.next.prev = newLeaf;
    }
    leaf.next = newLeaf;
    newLeaf.parent = leaf.parent;

    const promotedKey = newLeaf.entries[0].key;
    this._insertIntoParent(leaf, promotedKey, newLeaf);
  }

  _insertIntoParent(leftChild, promotedKey, rightChild) {
    if (!leftChild || promotedKey === undefined || !rightChild) return;

    const parent = leftChild.parent;

    // Trường hợp Root phân rã -> Tạo Root mới
    if (!parent) {
      const newRoot = new BPlusTreeNode(this.fanout);
      newRoot.keys = [promotedKey];
      newRoot.children = [leftChild, rightChild];
      leftChild.parent = newRoot;
      rightChild.parent = newRoot;
      this.root = newRoot;
      this.height++;
      return;
    }

    let insertPos = 0;
    while (insertPos < parent.keys.length && parent.keys[insertPos] < promotedKey) {
      insertPos++;
    }

    parent.keys.splice(insertPos, 0, promotedKey);
    parent.children.splice(insertPos + 1, 0, rightChild);
    rightChild.parent = parent;

    // Kiểm tra tràn trang Internal Node
    if (parent.children.length > parent.maxChildren) {
      this._splitInternalNode(parent);
    }
  }

  _splitInternalNode(node) {
    if (!node) return;

    const newInternal = new BPlusTreeNode(node.maxChildren);
    const isSequential =
      node.keys.length > 2 &&
      node.keys[node.keys.length - 1] > node.keys[node.keys.length - 2];

    let midKeyIndex;
    if (isSequential) {
      midKeyIndex = node.maxChildren - 1;
    } else {
      midKeyIndex = Math.floor(node.keys.length / 2);
    }

    const promotedKey = node.keys[midKeyIndex];

    // Cắt khóa và con trỏ
    newInternal.keys = node.keys.splice(midKeyIndex + 1);
    node.keys.splice(midKeyIndex, 1); // Loại bỏ mid key khỏi cả 2 nút con

    newInternal.children = node.children.splice(midKeyIndex + 1);
    for (const child of newInternal.children) {
      child.parent = newInternal;
    }
    newInternal.parent = node.parent;

    this._insertIntoParent(node, promotedKey, newInternal);
  }
}

/**
 * Lớp đại diện cho Heap Table lưu trữ vật lý các dòng dữ liệu (Table Heap Pages)
 */
class TableHeap {
  constructor({ name = 'table', rowsPerPage = 50 } = {}) {
    if (!Number.isInteger(rowsPerPage) || rowsPerPage < 1) {
      throw new TypeError('rowsPerPage must be a positive integer');
    }
    this.name = name;
    this.rowsPerPage = rowsPerPage;
    this.pages = []; // Mảng chứa các trang: { pageId, rows: [] }
    this.rowCount = 0;
    this.indexes = [];
  }

  /**
   * Chèn một dòng mới vào Table Heap
   * @param {Object} row
   * @returns {Object} Tuple Pointer { pageId, slotId }
   */
  insert(row) {
    if (!row || typeof row !== 'object') {
      throw new TypeError('Row must be a valid object');
    }

    if (this.pages.length === 0 || this.pages[this.pages.length - 1].rows.length >= this.rowsPerPage) {
      const newPage = {
        pageId: this.pages.length,
        rows: [],
      };
      this.pages.push(newPage);
    }

    const currentPage = this.pages[this.pages.length - 1];
    const slotId = currentPage.rows.length;
    const tuplePointer = {
      pageId: currentPage.pageId,
      slotId,
    };

    currentPage.rows.push({ ...row });
    this.rowCount++;

    // Cập nhật các chỉ mục đã liên kết
    for (const index of this.indexes) {
      index.insert(row, tuplePointer);
    }

    return tuplePointer;
  }

  /**
   * Lấy tổng số trang Table Heap
   * @returns {number}
   */
  getTotalPages() {
    return this.pages.length;
  }

  /**
   * Đọc trực tiếp một dòng qua Tuple Pointer (Bookmark Lookup)
   * @param {number} pageId
   * @param {number} slotId
   * @returns {Object|null}
   */
  getRow(pageId, slotId) {
    if (!Number.isInteger(pageId) || pageId < 0 || pageId >= this.pages.length) {
      return null;
    }
    const page = this.pages[pageId];
    if (!page || !Number.isInteger(slotId) || slotId < 0 || slotId >= page.rows.length) {
      return null;
    }
    return { ...page.rows[slotId] };
  }

  /**
   * Quét tuần tự toàn bộ bảng (Sequential Table Scan)
   * @param {Function} predicate
   * @returns {Object} { rows, heapPagesRead }
   */
  sequentialScan(predicate) {
    if (typeof predicate !== 'function') {
      return { rows: [], heapPagesRead: 0 };
    }

    const matchedRows = [];
    let heapPagesRead = 0;

    for (const page of this.pages) {
      heapPagesRead++;
      for (const row of page.rows) {
        if (predicate(row)) {
          matchedRows.push({ ...row });
        }
      }
    }

    return {
      rows: matchedRows,
      heapPagesRead,
    };
  }

  /**
   * Tạo chỉ mục B+Tree trên bảng
   * @param {Object} options
   * @returns {BPlusTreeIndex}
   */
  createIndex({ name, columns, fanout = 16, includeColumns = [] } = {}) {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new TypeError('Index requires at least one column');
    }

    const index = new BPlusTreeIndex({
      name: name || `idx_${this.name}_${columns.join('_')}`,
      columns,
      fanout,
      includeColumns,
      table: this,
    });

    // Nạp toàn bộ dữ liệu hiện có trong Heap Table vào B+Tree
    for (const page of this.pages) {
      for (let slotId = 0; slotId < page.rows.length; slotId++) {
        const row = page.rows[slotId];
        index.insert(row, { pageId: page.pageId, slotId });
      }
    }

    this.indexes.push(index);
    return index;
  }
}

/**
 * Mô phỏng phân tích kế hoạch thực thi câu lệnh truy vấn (EXPLAIN ANALYZE BUFFERS)
 * @param {Object} options
 * @returns {Object} Plan Details
 */
function explainQueryPlan({ table, index = null, range, selectColumns = [] } = {}) {
  if (!table || !range || typeof range !== 'object') {
    throw new TypeError('explainQueryPlan requires valid table and range');
  }

  // Trường hợp không sử dụng chỉ mục: Sequential Scan
  if (!index) {
    const scan = table.sequentialScan(row => row.id >= range.from && row.id <= range.to);
    return {
      scanType: 'Seq Scan',
      rowsReturned: scan.rows.length,
      indexPagesRead: 0,
      heapPagesRead: scan.heapPagesRead,
      isIndexOnlyScan: false,
      planSummary: `Seq Scan on ${table.name} (cost=0.00..${scan.heapPagesRead * 10} rows=${scan.rows.length}) (Buffers: shared hit=${scan.heapPagesRead})`,
    };
  }

  // Kiểm tra tính chất Covering Index
  const isCovered = index.isCovering(selectColumns);
  const scanResult = index.rangeScan({
    from: range.from,
    to: range.to,
    requiredColumns: selectColumns,
  });

  const scanType = isCovered ? 'Index Only Scan' : 'Index Scan with Bookmark Lookup';
  const heapPagesRead = isCovered ? 0 : scanResult.rows.length;

  return {
    scanType,
    rowsReturned: scanResult.rows.length,
    indexPagesRead: scanResult.indexPagesRead,
    heapPagesRead,
    isIndexOnlyScan: isCovered,
    planSummary: `${scanType} using ${index.name} on ${table.name} (Buffers: index=${scanResult.indexPagesRead}, heap=${heapPagesRead})`,
  };
}

module.exports = {
  BPlusTreeNode,
  BPlusTreeLeafNode,
  BPlusTreeIndex,
  TableHeap,
  explainQueryPlan,
  explainQueryCost: explainQueryPlan,
};

