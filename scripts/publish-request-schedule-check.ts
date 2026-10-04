import assert from 'node:assert/strict';
import { getDateValueMonthsLater, getUpcomingDates, getVisibleDates, servicePeriods } from '../src/pages/publishRequestSchedule';

const dates = getUpcomingDates(new Date(2026, 9, 4, 12), 7);
assert.equal(dates.length, 7);
assert.deepEqual(dates.slice(0, 3).map(date => date.label), ['今天', '明天', '后天']);
assert.equal(dates[0].dateLabel, '10月4日');
assert.equal(dates[0].weekday, '周日');
assert.equal(getVisibleDates(dates, false).length, 3);
assert.equal(getVisibleDates(dates, true).length, 7);
assert.equal(getDateValueMonthsLater(new Date(2026, 9, 4), 3), '2027-01-04');
assert.equal(getDateValueMonthsLater(new Date(2026, 0, 31), 1), '2026-02-28');
assert.deepEqual(servicePeriods.map(period => period.label), ['上午', '下午', '夜间']);
assert.ok(servicePeriods[2].slots.some(slot => slot.startsWith('20:')));

console.log('publish-request schedule checks passed');
