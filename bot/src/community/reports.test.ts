import { describe, expect, it } from 'vitest';
import { parseReportButton } from './reports.mts';

describe('parseReportButton', () => {
  it('parsuje akcję usunięcia z kanałem i ID wiadomości', () => {
    expect(parseReportButton('report:delete:111:222')).toEqual({
      action: 'delete',
      channelId: '111',
      messageId: '222',
    });
  });

  it('parsuje oddalenie', () => {
    expect(parseReportButton('report:dismiss')).toEqual({ action: 'dismiss' });
  });

  it('zwraca null dla obcych/uszkodzonych customId', () => {
    expect(parseReportButton('report:bogus')).toBeNull();
    expect(parseReportButton('appeal:approve:1')).toBeNull();
    expect(parseReportButton('')).toBeNull();
  });
});
