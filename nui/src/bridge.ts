export type NuiMessage<T = unknown> = { v: 1; type: string; payload: T };

const isNui = typeof (window as Window & { GetParentResourceName?: () => string }).GetParentResourceName === 'function';

export function resourceName() {
  try {
    return (window as Window & { GetParentResourceName?: () => string }).GetParentResourceName?.() ?? 'livebase-ui';
  } catch {
    return 'livebase-ui';
  }
}

export async function nuiCallback<T>(name: string, data: unknown = {}): Promise<T> {
  if (!isNui) {
    await new Promise((r) => setTimeout(r, 120));
    return { ok: true, preview: true } as T;
  }
  const res = await fetch(`https://${resourceName()}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return (await res.json()) as T;
}

export const PREVIEW = !isNui;
