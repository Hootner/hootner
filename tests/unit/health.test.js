describe('Health Check', () => {
  test('basic math works', () => {
    expect(1 + 1).toBe(2);
  });

  test('environment is test', () => {
    expect(process.env.NODE_ENV).toContain('test');
  });
});
