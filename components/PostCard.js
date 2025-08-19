// components/PostCard.js
import Link from 'next/link';

export default function PostCard({ post }) {
  const url = `/post/${post.id}`;
  const name = post.person_name || 'Unknown';

  return (
    <article style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '1.3rem',
      }}>
        <Link href={url} style={{ color: '#1976d2', textDecoration: 'none' }}>
          {post.title}
        </Link>
      </h3>
      <p style={{
        margin: '0 0 10px 0',
        color: '#555',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.9rem' }}>
        <span>👤 {name}</span>
        <span>❤️ {post.likes || 0} · 👁️ {post.views || 0}</span>
      </div>
    </article>
  );
}
