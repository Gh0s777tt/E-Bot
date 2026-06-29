import { describe, expect, it } from 'vitest';
import { canPin } from './pinreact.mts';

describe('canPin', () => {
  it('bez wymaganej roli → decyduje uprawnienie ManageMessages', () => {
    expect(canPin([], true, '')).toBe(true);
    expect(canPin([], false, '')).toBe(false);
    expect(canPin(['ktokolwiek'], false, '')).toBe(false);
  });

  it('z wymaganą rolą → wystarczy ta rola', () => {
    expect(canPin(['mod'], false, 'mod')).toBe(true);
    expect(canPin(['inna'], false, 'mod')).toBe(false);
  });

  it('ManageMessages zawsze wystarcza, nawet bez roli', () => {
    expect(canPin(['inna'], true, 'mod')).toBe(true);
  });
});
