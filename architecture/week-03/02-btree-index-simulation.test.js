/**
 * ============================================================================
 * 🧪 TEST SUITE: B+TREE INDEX ARCHITECTURE & COVERING INDEX (Week 3 Day 2)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm libraries)
 * - Test-First Discipline: Định nghĩa trọn vẹn 6 kịch bản kiểm thử đo đếm Page I/O
 *   trước khi cài đặt engine mô phỏng.
 * - Đo đếm định lượng:
 *   1. B+Tree Point Lookup & Tree Height (log_M N)
 *   2. Leaf Level Doubly Linked List Range Traversal
 *   3. Sequential Table Scan (O(N) Heap Pages)
 *   4. Secondary Index Scan + Bookmark Lookup Penalty (Random Heap I/O)
 *   5. Covering Index (Index-Only Scan with Zero Heap Fetches)
 *   6. Quantitative I/O Reduction Benchmark (Covering Index tiết kiệm >= 80% Page I/O)
 * ============================================================================
 */

const assert = require('node:assert');
const {
  TableHeap,
  explainQueryPlan,
} = require('./02-btree-index-simulation');

console.log('--- Starting Test Suite: B+Tree Index Architecture & Covering Index ---');

// Helper generator to create structured banking transaction records
function generateTransactions(count) {
  const transactions = [];
  const baseTimestamp = 1774828800000; // Base epoch timestamp

  for (let i = 1; i <= count; i++) {
    // 50 accounts, cyclic assignment
    const accountNum = 1000 + (i % 50);
    const accountId = `ACC_${accountNum}`;
    const amount = (i * 17) % 5000 + 10; // Varied amount $10 - $5010
    const status = i % 20 === 0 ? 'FLAGGED' : 'SETTLED';
    const createdAt = baseTimestamp + i * 60000; // 1 minute interval

    transactions.push({
      id: i,
      account_id: accountId,
      amount: amount,
      status: status,
      created_at: createdAt,
    });
  }
  return transactions;
}

// ============================================================================
// TC-01: B+Tree Point Lookup & Tree Height Guarantee
// Invariant: Point lookup traverses root -> internal -> leaf in <= h page reads
// ============================================================================
console.log('Running TC-01: B+Tree Point Lookup & Height Invariant...');
{
  const table = new TableHeap({ name: 'transactions', rowsPerPage: 50 });
  const data = generateTransactions(500);
  data.forEach(row => table.insert(row));

  // Fanout = 8: 500 records -> leaf capacity 8 -> ~63 leaves -> height h <= 3
  const index = table.createIndex({
    name: 'idx_txn_id',
    columns: ['id'],
    fanout: 8,
  });

  const searchId = 250;
  const result = index.pointLookup(searchId);

  assert.ok(result.found, `Transaction ID ${searchId} must be found`);
  assert.strictEqual(result.row.id, 250, 'Matched record ID must equal 250');
  assert.strictEqual(result.row.account_id, data[249].account_id, 'Account ID must match source data');

  // Verify tree height & page I/O constraint
  const treeHeight = index.getHeight();
  assert.ok(treeHeight <= 3, `B+Tree height must be <= 3 for 500 items with fanout 8 (actual: ${treeHeight})`);
  assert.strictEqual(result.indexPagesRead, treeHeight, 'Point lookup must read exactly h index pages');
  assert.strictEqual(result.heapPagesRead, 1, 'Point lookup with bookmark lookup reads exactly 1 heap page');
  console.log(`✅ TC-01 PASSED: Point lookup completed in ${result.indexPagesRead} index page reads (Height: ${treeHeight}).`);
}

// ============================================================================
// TC-02: B+Tree Range Query via Doubly Linked Leaf Nodes
// Invariant: Range query finds first leaf, then scans leaf.next without root traversal
// ============================================================================
console.log('Running TC-02: Range Query via Doubly Linked Leaf Nodes...');
{
  const table = new TableHeap({ name: 'transactions', rowsPerPage: 50 });
  const data = generateTransactions(200);
  data.forEach(row => table.insert(row));

  const index = table.createIndex({
    name: 'idx_txn_id',
    columns: ['id'],
    fanout: 6,
  });

  // Query range: ID 50 to 99 (inclusive: 50 records)
  const rangeResult = index.rangeScan({
    from: 50,
    to: 99,
    requiredColumns: ['id', 'amount'],
  });

  assert.strictEqual(rangeResult.rows.length, 50, 'Range scan [50, 99] must return exactly 50 records');
  assert.strictEqual(rangeResult.rows[0].id, 50, 'First record must be ID 50');
  assert.strictEqual(rangeResult.rows[49].id, 99, 'Last record must be ID 99');

  // Verify leaf forward traversal occurred
  assert.ok(rangeResult.leafPagesTraversed >= 2, 'Range of 50 items with node size 6 must traverse multiple leaf pages');
  console.log(`✅ TC-02 PASSED: 50 items fetched across ${rangeResult.leafPagesTraversed} leaf pages via doubly linked pointers.`);
}

// ============================================================================
// TC-03: Sequential Table Scan Baseline (Seq Scan - O(N) Heap Pages)
// Invariant: Without index, query must read 100% of Table Heap Pages
// ============================================================================
console.log('Running TC-03: Sequential Table Scan Baseline (No Index)...');
{
  const table = new TableHeap({ name: 'transactions', rowsPerPage: 50 });
  const totalRows = 2000;
  generateTransactions(totalRows).forEach(row => table.insert(row));

  const totalHeapPages = table.getTotalPages();
  assert.strictEqual(totalHeapPages, 40, '2000 rows with 50 rows/page must occupy exactly 40 heap pages');

  const seqScanResult = table.sequentialScan(row => row.account_id === 'ACC_1015');

  assert.strictEqual(seqScanResult.heapPagesRead, 40, 'Seq scan must read all 40 table heap pages');
  assert.strictEqual(seqScanResult.rows.length, 40, 'Each of the 50 accounts has 40 transactions (2000/50)');
  console.log(`✅ TC-03 PASSED: Sequential scan read all ${seqScanResult.heapPagesRead} heap pages for filtering.`);
}

// ============================================================================
// TC-04: Secondary Index Scan + Bookmark Lookup Penalty
// Invariant: Non-covering index requires random I/O heap fetches for missing columns
// ============================================================================
console.log('Running TC-04: Secondary Index Scan + Bookmark Lookup Penalty...');
{
  const table = new TableHeap({ name: 'transactions', rowsPerPage: 50 });
  const totalRows = 2000;
  generateTransactions(totalRows).forEach(row => table.insert(row));

  // Secondary index on ID only
  const index = table.createIndex({
    name: 'idx_txn_id',
    columns: ['id'],
    fanout: 10,
    includeColumns: [], // Does NOT include 'amount' or 'status'
  });

  // Query requiring non-indexed column 'amount'
  const plan = explainQueryPlan({
    table,
    index,
    range: { from: 100, to: 199 }, // 100 records
    selectColumns: ['id', 'amount'], // 'amount' requires Bookmark Lookup
  });

  assert.strictEqual(plan.scanType, 'Index Scan with Bookmark Lookup');
  assert.strictEqual(plan.rowsReturned, 100);
  assert.ok(plan.indexPagesRead > 0, 'Must read index pages');
  assert.ok(plan.heapPagesRead > 0, 'Must perform heap page fetches for "amount"');
  assert.strictEqual(plan.isIndexOnlyScan, false, 'Cannot be Index-Only Scan when column is missing');
  console.log(`✅ TC-04 PASSED: Index Scan required ${plan.indexPagesRead} index pages + ${plan.heapPagesRead} random heap fetches.`);
}

// ============================================================================
// TC-05: Covering Index (Index-Only Scan with Zero Heap Fetches)
// Invariant: When all queried columns reside in index (via INCLUDE), Heap I/O is 0
// ============================================================================
console.log('Running TC-05: Covering Index (Index-Only Scan with Zero Heap Reads)...');
{
  const table = new TableHeap({ name: 'transactions', rowsPerPage: 50 });
  const totalRows = 2000;
  generateTransactions(totalRows).forEach(row => table.insert(row));

  // Covering index: Keys (id) + Included Payload (amount)
  const coveringIndex = table.createIndex({
    name: 'idx_covering_id_amount',
    columns: ['id'],
    fanout: 10,
    includeColumns: ['amount'], // Covering optimization
  });

  const plan = explainQueryPlan({
    table,
    index: coveringIndex,
    range: { from: 100, to: 199 },
    selectColumns: ['id', 'amount'],
  });

  assert.strictEqual(plan.scanType, 'Index Only Scan');
  assert.strictEqual(plan.rowsReturned, 100);
  assert.strictEqual(plan.heapPagesRead, 0, 'Covering index MUST perform 0 heap page fetches');
  assert.strictEqual(plan.isIndexOnlyScan, true, 'Plan must be verified as Index Only Scan');
  console.log(`✅ TC-05 PASSED: Covering Index eliminated 100% of Heap Fetches (Heap Pages Read: 0).`);
}

// ============================================================================
// TC-06: Quantitative Benchmark: >= 80% I/O Reduction Verification
// Invariant: Covering Index total pages read is at least 80% lower than Secondary Index
// ============================================================================
console.log('Running TC-06: Quantitative Benchmark (>= 80% I/O Reduction)...');
{
  const table = new TableHeap({ name: 'transactions', rowsPerPage: 50 });
  const totalRows = 5000;
  generateTransactions(totalRows).forEach(row => table.insert(row));

  // 1. Regular Secondary Index (id only)
  const secondaryIndex = table.createIndex({
    name: 'idx_secondary_id',
    columns: ['id'],
    fanout: 16,
    includeColumns: [],
  });

  // 2. Covering Index (id + amount)
  const coveringIndex = table.createIndex({
    name: 'idx_covering_id_amount',
    columns: ['id'],
    fanout: 16,
    includeColumns: ['amount'],
  });

  // Range query: 300 transactions
  const secondaryPlan = explainQueryPlan({
    table,
    index: secondaryIndex,
    range: { from: 500, to: 799 },
    selectColumns: ['id', 'amount'],
  });

  const coveringPlan = explainQueryPlan({
    table,
    index: coveringIndex,
    range: { from: 500, to: 799 },
    selectColumns: ['id', 'amount'],
  });

  const secondaryTotalIO = secondaryPlan.indexPagesRead + secondaryPlan.heapPagesRead;
  const coveringTotalIO = coveringPlan.indexPagesRead + coveringPlan.heapPagesRead;

  console.log(`--- Benchmark Results (300 Rows Scanned) ---`);
  console.log(`Secondary Index Total Page I/O: ${secondaryTotalIO} (Index: ${secondaryPlan.indexPagesRead}, Heap: ${secondaryPlan.heapPagesRead})`);
  console.log(`Covering Index Total Page I/O : ${coveringTotalIO} (Index: ${coveringPlan.indexPagesRead}, Heap: 0)`);

  const reductionPercentage = ((secondaryTotalIO - coveringTotalIO) / secondaryTotalIO) * 100;
  console.log(`I/O Reduction: ${reductionPercentage.toFixed(2)}%`);

  assert.ok(
    reductionPercentage >= 80,
    `Covering Index must reduce Page I/O by at least 80% (Actual reduction: ${reductionPercentage.toFixed(2)}%)`
  );
  console.log('✅ TC-06 PASSED: Verified 80%+ I/O reduction via Covering Index.');
}

console.log('--- ALL 6 B+TREE & COVERING INDEX TESTS PASSED SUCCESSFULLY ---');

