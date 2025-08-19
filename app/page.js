// app/page.js
'use client';

import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { supabase } from './lib/supabaseClient';

export default function Home() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract person name
  const extractName = (txt) => {
    const match = txt.match(/name\s*[:\-]\s*([^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  // Check age
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

    const { error } = await supabase.from('posts').insert([
      {
        title: title.trim().substring(0, 100),
        content: content.trim().substring(0, 5000),
        person_name: extractName(content) || extractName(title),
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
    <>
      <header>
        <h1 style={{
          fontSize: '2.8rem',
          margin: '10px 0 8px 0',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #d32f2f, #1976d2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          caught.wiki
        </h1>
        <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '24px' }}>
          Post. Rank. Download. No moderation. No liability.
        </p>
      </header>

      <main>
        <section style={{ marginBottom: '40px' }}>
          <h2>Submit a Dossier</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Title (e.g., John Doe Scamming)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <textarea
              placeholder="Content (use 'age: 14' to block submission)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="5"
              style={{ padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '6px' }}
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
                cursor: 'pointer'
              }}
            >
              Post Anonymously
            </button>
          </form>
        </section>

        <section>
          <h2>Trending Posts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : posts.length === 0 ? (
            <p><em>No posts yet. Be the first.</em></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
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
    </>
  );
}
