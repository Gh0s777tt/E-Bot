// Zaplanowane posty — GET listy + POST zapis (settings 'scheduled_posts'). Chronione sesją (proxy).

import { guardLimit } from '../../../lib/planLimits';
import {
  getScheduledPosts,
  type ScheduledPost,
  saveScheduledPosts,
} from '../../../lib/scheduledPosts';
import { parseBody, scheduledPostsSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ posts: await getScheduledPosts() });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, scheduledPostsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const current = (await getScheduledPosts()).length;
  const gate = await guardLimit('scheduledPosts', parsed.data.posts.length, current);
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: 403 });
  await saveScheduledPosts(parsed.data.posts as ScheduledPost[]);
  return Response.json({ ok: true, posts: await getScheduledPosts() });
}
