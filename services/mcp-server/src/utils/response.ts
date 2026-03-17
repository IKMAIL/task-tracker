export function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function fail(err: unknown) {
  return { content: [{ type: 'text' as const, text: `Error: ${(err as Error).message || err}` }], isError: true };
}
