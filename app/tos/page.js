// app/tos/page.js
export default function ToS() {
  return (
    <div style={{ lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Terms of Use – caught.wiki</h1>
      <p><strong>Last Updated:</strong> June 2025</p>

      <h2>1. Acceptance</h2>
      <p>By using this site, you agree to these terms.</p>

      <h2>2. No Moderation</h2>
      <p>Fully unmoderated. You are responsible for what you post.</p>

      <h2>3. No Liability</h2>
      <p>We hold no liability for content, accuracy, or legality.</p>

      <h2>4. No Commercial Use</h2>
      <p>Do not use this site to build competing services or profit from our data.</p>

      <h2>5. Age Protection</h2>
      <p>
        Posts containing <code>age: X</code> where X < 16 are blocked on submission and can be auto-deleted if reported.
        This is automated. Re-upload is allowed.
      </p>

      <h2>6. Post Deletion</h2>
      <p>Any user can delete any post by pressing <kbd>Ctrl+D</kbd> and entering code <strong>8214</strong>.</p>

      <h2>7. Changes</h2>
      <p>We may update these terms at any time.</p>

      <hr style={{ margin: '40px 0' }} />
      <p style={{ textAlign: 'center' }}>
        <a href="/" style={{ color: '#1976d2' }}>&larr; Back to caught.wiki</a>
      </p>
    </div>
  );
}
