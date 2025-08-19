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

    // Sign in anonymously
    const { data: { user } } = await supabase.auth.signInAnonymously();
    if (!user) {
      alert("Auth failed");
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
      alert('Dox posted successfully!');
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
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>caught.wiki</h1>
        <p style={styles.subtitle}>Post. Rank. Download. No moderation. No liability.</p>
      </header>

      <main>
        <section style={styles.section}>
          <h2 style={styles.h2}>Submit a Dox</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Title (e.g., John Doe Scamming)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
            <textarea
              placeholder="Paste full dox here (use 'age: 14' to block submission)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="5"
              style={styles.textarea}
            />
            <button type="submit" style={styles.button}>
              Post Dox Anonymously
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Trending Dox</h2>
          {loading ? (
            <p>Loading...</p>
          ) : posts.length === 0 ? (
            <p><em>No dox yet. Be the first.</em></p>
          ) : (
            <div style={styles.posts}>
              {posts.map(post => (
                <article key={post.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>
                    <a href={`/post/${post.id}`} style={styles.link}>
                      {post.title}
                    </a>
                  </h3>
                  <p style={styles.cardContent}>
                    {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
                  </p>
                  <div style={styles.meta}>
                    ❤️ {post.likes || 0} · 👁️ {post.views || 0}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer style={styles.footer}>
        <p>
          <a href="/tos" style={styles.link}>Terms of Use</a> | Not affiliated.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Inter, sans-serif',
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  header: {
    marginBottom: '40px'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #d32f2f, #1976d2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    margin: '10px 0'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem'
  },
  section: {
    marginBottom: '40px'
  },
  h2: {
    fontSize: '1.8rem',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px'
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px'
  },
  button: {
    padding: '14px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 600
  },
  posts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.3rem'
  },
  cardContent: {
    margin: '0 0 10px 0',
    color: '#555'
  },
  meta: {
    color: '#777',
    fontSize: '0.9rem'
  },
  footer: {
    marginTop: '60px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    color: '#888',
    fontSize: '0.9rem',
    textAlign: 'center'
  },
  link: {
    color: '#1976d2',
    textDecoration: 'none'
  }
};
