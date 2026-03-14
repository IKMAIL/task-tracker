# Mistake Journal

| #   | Mistake | Cause | Lesson Learned | Fixed Code Reference |
| --- | ------- | ----- | -------------- | -------------------- |
| 1   | Called `apiFetch<AuditResponse>(...)` with a generic type argument that doesn't exist on the function | Assumed `apiFetch` was a typed generic like axios — it returns `Promise<any>` with no type parameter | Always verify a function's type signature before using generic type arguments; don't assume type-parameterization without reading the definition | `apps/web-frontend/src/api/auditApi.ts` — removed `<AuditResponse>` from `apiFetch` call |
