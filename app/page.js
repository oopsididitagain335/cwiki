// app/page.js
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabaseClient';

export default function Home() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const extractAge = (txt) => {
    const match = txt.match(/age\s*[:\-–]\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const titleAge = extractAge(title);
    const contentAge = extractAge(content);

    if ((titleAge !== null && titleAge < 16) || (contentAge !== null && contentAge < 16)) {
      alert("❌ Posts with 'age: <16' are not allowed.");
      return;
    }

    // Sign in anonymously if not already
    const { data: { user } } = await supabase.auth.signInAnonymously();
    if (!user) {
      alert("Failed to authenticate.");
      return;
    }

    const { error } = await supabase.from('posts').insert([
      {
        title: title.trim().substring(0, 100),
        content: content.trim().substring(0, 5000),
        user_id: user.id,
      },
    ]);

    if (error) {
      alert('Failed to post: ' + error.message);
    } else {
      alert('Posted successfully!');
      setTitle('');
      setContent('');
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('ranked_posts')
        .select('*')
        .limit(100);

      if (error) console.error('Load error:', error);
      else setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      color: '#1a1a1a',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <header>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #d32f2f, #1976d2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          caught.wiki
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Post. Rank. Download. No moderation. No liability.
        </p>
      </header>

      <main>
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Submit a Dossier</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Title (e.g., John Doe Scamming)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <textarea
              placeholder="Content (use 'age: 18' to block under-16)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="5"
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Post Anonymously
            </button>
          </form>
        </section>

        <section>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Trending Posts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : posts.length === 0 ? (
            <p><em>No posts yet. Be the first.</em></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {posts.map(post => (
                <article key={post.id} style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                    {post.title}
                  </h3>
                  <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                    {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ color: '#777', fontSize: '0.9rem' }}>
                    ❤️ {post.likes || 0} · 👁️ {post.views || 0}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
        color: '#888',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        <p>
          <a href="/tos">Terms of Use</a> | Not affiliated with any organization.
        </p>
      </footer>
    </div>
  );
}
