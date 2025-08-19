// app/api/report-post/route.js
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });

    const {  post } = await supabase.from('posts').select('title, content').eq('id', id).single();
    if (!post) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const text = `${post.title} ${post.content}`.toLowerCase();
    const ageMatch = text.match(/age\s*[:\-–]\s*(\d+)/);

    if (ageMatch && parseInt(ageMatch[1]) < 16) {
      await supabase.from('posts').delete().eq('id', id);
      return new Response(JSON.stringify({ status: 'deleted' }), { status: 200 });
    }

    return new Response(JSON.stringify({ status: 'reported', reason: 'no under-16' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
