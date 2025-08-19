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

      if (error) {
        console.error('Post not found:', error);
      } else {
        setPost(data);
        // Increment view
        await supabase
          .from('posts')
          .update({ views: data.views + 1 })
          .eq('id', id);
      }
      setLoading(false);
    };

    if (id) fetchPost();
  }, [id]);

  // Ctrl+D to delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setShowDeleteModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDelete = async () => {
    if (deleteCode === '8214') {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Delete failed');
      } else {
        setDeleted(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } else {
      alert('❌ Invalid code.');
    }
  };

  const downloadDox = () => {
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${baseURL}${pathname}`;
    const doxContent = `
====================================
         DOSSIER: ${post.title.toUpperCase()}
====================================

Post ID: ${post.id}
Published: ${new Date(post.created_at).toLocaleString()}
Views: ${post.views}
Likes: ${post.likes}
URL: ${url}

--- CONTENT ---
${post.content}

====================================
⚠️ This dossier was published on caught.wiki, an unmoderated platform.
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

  const handleReport = async () => {
    const text = `${post.title} ${post.content}`.toLowerCase();
    const ageMatch = text.match(/age\s*[:\-–]\s*(\d+)/);
    if (ageMatch && parseInt(ageMatch[1], 10) < 16) {
      const confirmed = window.confirm(
        `This post mentions age: ${ageMatch[1]} (<16). Report to delete?`
      );
      if (confirmed) {
        const res = await fetch('/api/report-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: post.id }),
        });
        if (res.ok) {
          alert('Post deleted (under-16 content).');
          setDeleted(true);
          setTimeout(() => window.location.href = '/', 1500);
        } else {
          alert('Report failed.');
        }
      }
    } else {
      alert('No under-16 age found.');
    }
  };

  if (deleted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <h2>🗑️ Post Deleted</h2>
        <p><a href="/">← Back to caught.wiki</a></p>
      </div>
    );
  }

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div>
      <header>
        <h1 style={{ fontSize: '2.2rem', color: '#d32f2f' }}>{post.title}</h1>
        <p style={{ color: '#777', fontSize: '0.9rem' }}>
          Published: {new Date(post.created_at).toLocaleString()} &middot; 
          Views: {post.views} &middot; Likes: {post.likes}
        </p>
      </header>

      <main style={{ marginTop: '20px', lineHeight: '1.6' }}>
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
          <button
            onClick={downloadDox}
            style={{
              padding: '10px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            💾 Download Dox (.txt)
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🗑️ Delete (Ctrl+D)
          </button>
          <button
            onClick={handleReport}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f57c00',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ⚠️ Report (if age {"<"} 16)
          </button>
        </div>
      </main>

      <div style={{ marginTop: '20px' }}>
        <LikeButton post={post} onUpdate={(newLikes) => setPost({ ...post, likes: newLikes })} />
      </div>

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#d32f2f' }}>Delete Post?</h3>
            <p>This will permanently delete the post.</p>
            <input
              type="password"
              placeholder="Enter code: 8214"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ccc',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
        color: '#888',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        <p>
          <a href="/">← Back to caught.wiki</a> |{' '}
          <a href="/tos">Terms of Use</a>
        </p>
        <p>Press Ctrl+D to delete this post.</p>
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
    const { error } = await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', post.id);

    if (error) {
      alert('Like failed');
      setDisabled(false);
    } else {
      setLikes(newLikes);
      onUpdate?.(newLikes);
    }
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
