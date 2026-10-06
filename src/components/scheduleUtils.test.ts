import assert from 'node:assert/strict';
import { findInitialScheduleDate, formatDateKey } from './scheduleUtils';

const today = new Date(2026, 9, 6);

assert.equal(formatDateKey(today), '2026-10-06');
assert.equal(
  formatDateKey(findInitialScheduleDate(today, ['2026-10-09', '2026-10-12'])),
  '2026-10-09',
);
assert.equal(
  formatDateKey(findInitialScheduleDate(today, ['2026-10-06', '2026-10-09'])),
  '2026-10-06',
);
