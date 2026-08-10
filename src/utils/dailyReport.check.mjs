import assert from 'node:assert/strict';
import { addReportRow, emptyReport, emptyUpcomingRow, MAX_REPORT_ROWS } from './dailyReport.js';

const report = emptyReport();
assert.equal(report.accomplishments.length, 1);
assert.equal(report.completed_work.length, 1);
assert.equal(report.upcoming_work.length, 1);

let rows = report.upcoming_work;
while (rows.length < MAX_REPORT_ROWS) rows = addReportRow(rows, emptyUpcomingRow());
assert.equal(addReportRow(rows, emptyUpcomingRow()).length, MAX_REPORT_ROWS);

console.log('daily report rows: all checks passed');
