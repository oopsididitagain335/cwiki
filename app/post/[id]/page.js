// app/post/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function PostPage({ params }) {
  const { id } = params;
  const pathname = usePathname();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error('Not found:', error);
      else {
        setPost(data);
        await supabase.from('posts').update({ views: data.views + 1 }).eq('id', id);
      }
      setLoading(false);
    };

    if (id) fetchPost();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowDeleteModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDelete = async () => {
    if (deleteCode === '8214') {
      await supabase.from('posts').delete().eq('id', id);
      setDeleted(true);
      setTimeout(() => window.location.href = '/', 1500);
    } else {
      alert('❌ Invalid code.');
    }
  };

  const handleReport = async () => {
    const text = `${post.title} ${post.content}`.toLowerCase();
    const ageMatch = text.match(/age\s*[:\-–]\s*(\d+)/);
    if (ageMatch && parseInt(ageMatch[1]) < 16) {
      if (window.confirm(`Report post with age: ${ageMatch[1]}?`)) {
        const res = await fetch('/api/report-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: post.id }),
        });
        if (res.ok) {
          alert('Post deleted (age < 16).');
          setDeleted(true);
          setTimeout(() => window.location.href = '/', 1500);
        }
      }
    } else {
      alert('No under-16 age found.');
    }
  };

  const downloadDox = () => {
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${baseURL}${pathname}`;
    const doxContent = `
====================================
         DOSSIER: ${post.title.toUpperCase()}
====================================

Name: ${post.person_name || 'Unknown'}
Post ID: ${post.id}
Published: ${new Date(post.created_at).toLocaleString()}
Views: ${post.views}
Likes: ${post.likes}
URL: ${url}

--- CONTENT ---
${post.content}

====================================
⚠️ This dossier was published on caught.wiki, an unmoderated platform.
Operators assume no liability. Use at your own risk.
====================================
    `.trim();

    const blob = new Blob([doxContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dox-${post.id.substring(0, 8)}.txt`;
    a.click();
  };

  if (deleted) return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h2>🗑️ Post Deleted</h2>
      <p><Link href="/">← Back to caught.wiki</Link></p>
    </div>
  );

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div>
      <header>
        <h1 style={{ color: '#d32f2f', fontSize: '2.2rem' }}>{post.title}</h1>
        {post.person_name && <p><strong>Subject:</strong> {post.person_name}</p>}
        <p style={{ color: '#777' }}>
          Published: {new Date(post.created_at).toLocaleString()} · 
          Views: {post.views} · Likes: {post.likes}
        </p>
      </header>

      <main style={{ marginTop: '20px' }}>
        <div style={{
          whiteSpace: 'pre-wrap',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '6px'
        }}>
          {post.content}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={downloadDox} style={btnStyle('#1976d2')}>💾 Download Dox (.txt)</button>
          <button onClick={() => setShowDeleteModal(true)} style={btnStyle('#999')}>🗑️ Delete (Ctrl+D)</button>
          <button onClick={handleReport} style={btnStyle('#f57c00')}>⚠️ Report (if age < 16)</button>
        </div>
      </main>

      <div style={{ marginTop: '20px' }}>
        <LikeButton post={post} onUpdate={(l) => setPost({ ...post, likes: l })} />
      </div>

      {showDeleteModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ color: '#d32f2f' }}>⚠️ Delete Post?</h3>
            <input
              type="password"
              placeholder="Enter code: 8214"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteModal(false)} style={btnStyle('#ccc', 'black')}>Cancel</button>
              <button onClick={handleDelete} style={btnStyle('#d32f2f')}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
        <p><Link href="/">← Back to caught.wiki</Link> | <Link href="/tos">Terms</Link></p>
        <p>Press Ctrl+D to delete.</p>
      </footer>
    </div>
  );
}

// LikeButton
function LikeButton({ post, onUpdate }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [disabled, setDisabled] = useState(false);

  const handleLike = async () => {
    if (disabled) return;
    setDisabled(true);
    const newLikes = likes + 1;
    await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);
    setLikes(newLikes);
    onUpdate?.(newLikes);
  };

  return (
    <button
      onClick={handleLike}
      disabled={disabled}
      style={{
        padding: '6px 12px',
        backgroundColor: disabled ? '#ccc' : '#d32f2f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'default' : 'pointer'
      }}
    >
      ❤️ {disabled ? 'Liked' : 'Like'} ({likes})
    </button>
  );
}

// Styles
const btnStyle = (bg, color = 'white') => ({
  padding: '10px 16px', border: 'none', borderRadius: '6px',
  backgroundColor: bg, color, cursor: 'pointer', fontSize: '14px'
});

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bg: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { bg: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center' };
