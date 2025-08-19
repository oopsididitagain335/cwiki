// app/post/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@lib/supabaseClient';

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
    if (ageMatch && parseInt(ageMatch[1], 10) < 16) {
      const confirmed = window.confirm(`Report post with age: ${ageMatch[1]} (<16)?`);
      if (confirmed) {
        const res = await fetch('/api/report-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: post.id }),
        });
        if (res.ok) {
          alert('Dox deleted (under-16 content).');
          setDeleted(true);
          setTimeout(() => window.location.href = '/', 1500);
        }
      }
    } else {
      alert('No under-16 age found.');
    }
  };

  const downloadDox = () => {
    const baseURL = window.location.origin;
    const url = `${baseURL}${pathname}`;
    const doxContent = `
====================================
           DOX: ${post.title.toUpperCase()}
====================================

Post ID: ${post.id}
URL: ${url}
Published: ${new Date(post.created_at).toLocaleString()}
Views: ${post.views}
Likes: ${post.likes}

--- FULL DOX ---
${post.content}

====================================
⚠️ This dox was posted on caught.wiki, an unmoderated platform.
The operators assume no liability for accuracy or legality.
Use at your own risk.
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
      <h2>🗑️ Dox Deleted</h2>
      <p><a href="/">← Back to caught.wiki</a></p>
    </div>
  );

  if (loading) return <p>Loading dox...</p>;
  if (!post) return <p>Dox not found.</p>;

  return (
    <div style={styles.container}>
      <header>
        <h1 style={styles.title}>{post.title}</h1>
        <p style={styles.meta}>
          Published: {new Date(post.created_at).toLocaleString()} · 
          Views: {post.views} · Likes: {post.likes}
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          {post.content.split('\n').map((line, i) => (
            <p key={i} style={styles.line}>{line}</p>
          ))}
        </div>

        <div style={styles.buttons}>
          <button onClick={downloadDox} style={styles.btnPrimary}>💾 Download Dox (.txt)</button>
          <button onClick={() => setShowDeleteModal(true)} style={styles.btnSecondary}>🗑️ Delete (Ctrl+D)</button>
          <button onClick={handleReport} style={styles.btnReport}>⚠️ Report (if age {"<"} 16)</button>
        </div>
      </main>

      <div style={styles.likes}>
        <LikeButton post={post} onUpdate={(l) => setPost({ ...post, likes: l })} />
      </div>

      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ color: '#d32f2f' }}>Delete Dox?</h3>
            <p>This will permanently delete the dox.</p>
            <input
              type="password"
              placeholder="Enter code: 8214"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              style={styles.input}
              autoFocus
            />
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.btnCancel}>Cancel</button>
              <button onClick={handleDelete} style={styles.btnDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p>
          <a href="/">← Back to caught.wiki</a> | <a href="/tos">Terms</a>
        </p>
        <p>Press Ctrl+D to delete.</p>
      </footer>
    </div>
  );
}

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

const styles = {
  container: { padding: '20px', lineHeight: '1.6' },
  title: { fontSize: '2.2rem', color: '#d32f2f', margin: '10px 0' },
  meta: { color: '#777', fontSize: '0.9rem' },
  main: { marginTop: '20px' },
  content: { whiteSpace: 'pre-wrap', padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px' },
  line: { margin: '8px 0' },
  buttons: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '30px' },
  btnPrimary: { padding: '10px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnSecondary: { padding: '10px 16px', background: '#999', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnReport: { padding: '10px 16px', background: '#f57c00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  likes: { marginTop: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bg: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { bg: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center' },
  input: { padding: '10px', width: '100%', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' },
  modalButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
  btnCancel: { padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnDelete: { padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  footer: { marginTop: '60px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }
};
