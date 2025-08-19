// app/tos/page.js
export default function ToS() {
  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>Terms of Use – caught.wiki</h1>
      <p><strong>Last Updated:</strong> June 2025</p>

      <h2>1. Acceptance</h2>
      <p>
        By using <strong>caught.wiki</strong>, you agree to these Terms of Use. If you do not agree, do not use this site.
      </p>

      <h2>2. No Moderation</h2>
      <p>
        This site is <strong>fully unmoderated</strong>. Anyone can post dox anonymously.
        We do not review, filter, or approve submissions. All content is the sole responsibility of the submitter.
      </p>

      <h2>3. No Liability</h2>
      <p>
        The operators of <strong>caught.wiki</strong> make no representations or warranties regarding the accuracy, safety,
        legality, or decency of content posted by users. We <strong>expressly disclaim all liability</strong> for any harm,
        loss, or damage arising from your use of this site or any content on it.
      </p>

      <h2>4. No Ownership or Rights</h2>
      <p>
        By posting, you retain any rights you may have in your content, but you grant a broad license to the public to view and share it.
        We do not claim ownership. However, <strong>we reserve the right to remove or modify the site at any time</strong>.
      </p>

      <h2>5. No Commercial Use Against Us</h2>
      <p>
        You may not use this site or its data to build competing services, scrape for commercial databases, or exploit the content
        in a way designed to <strong>generate revenue directly from our infrastructure</strong> without permission.
      </p>

      <h2>6. Automated Protection for Minors</h2>
      <p>
        If a post contains keywords indicating the subject is under 16 years old (e.g., "14-year-old", "minor"),
        and is reported, it will be <strong>automatically deleted</strong>.
      </p>

      <h2>7. No Warranty & "As Is" Use</h2>
      <p>
        The site is provided <strong>"as is"</strong> without warranties of any kind, express or implied.
        We are not responsible for downtime, data loss, or misuse.
      </p>

      <hr style={{ margin: '40px 0' }} />
      <p style={{ textAlign: 'center' }}>
        <a href="/" style={{ color: '#1976d2' }}>← Back to caught.wiki</a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    lineHeight: '1.8',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px'
  },
  h1: {
    fontSize: '2rem'
  }
};
