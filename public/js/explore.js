let me = null;

async function loadExplore() {
  const feed = document.getElementById('explore-feed');
  feed.innerHTML = '<p class="empty">Loading…</p>';
  try {
    const { posts } = await API.get('/api/posts/explore');
    if (!posts.length) { feed.innerHTML = '<p class="empty">No posts yet. Run <code>npm run seed</code> for demo data.</p>'; return; }
    feed.innerHTML = posts.map((p) => `
      <article class="card post">
        <div class="post-head">
          <a href="/profile.html?u=${p.author.username}"><img class="avatar" src="${avatarUrl(p.author)}"></a>
          <div><a href="/profile.html?u=${p.author.username}" class="post-name">${esc(p.author.name)}</a>
          <div class="post-handle">@${esc(p.author.username)} · ${timeAgo(p.createdAt)}</div></div>
        </div>
        <p class="post-text">${esc(p.text)}</p>
        ${p.image ? `<img class="post-img" src="${esc(p.image)}" loading="lazy">` : ''}
        <div class="post-actions"><span>❤ ${p.likesCount != null ? p.likesCount : p.likes.length}</span><span>💬 ${p.commentsCount || 0}</span></div>
      </article>`).join('');
  } catch (e) { feed.innerHTML = `<p class="empty">${e.message}</p>`; }
}

async function loadPeople() {
  const box = document.getElementById('people');
  const q = document.getElementById('people-search').value.trim();
  try {
    const { users } = await API.get('/api/users?search=' + encodeURIComponent(q));
    if (!users.length) { box.innerHTML = '<p style="color:var(--muted);font-size:14px">No people found.</p>'; return; }
    box.innerHTML = users.map((u) => `
      <div class="suggestion"><a href="/profile.html?u=${u.username}"><img class="avatar" src="${avatarUrl(u)}"></a>
        <div class="info"><a href="/profile.html?u=${u.username}"><strong>${esc(u.name)}</strong></a><span>@${esc(u.username)}</span></div>
        <button class="btn btn-primary btn-sm" data-follow="${u._id}">Follow</button></div>`).join('');
    box.querySelectorAll('[data-follow]').forEach((btn) => btn.addEventListener('click', async () => {
      try { const r = await API.post(`/api/users/${btn.dataset.follow}/follow`); btn.textContent = r.following ? 'Following' : 'Follow'; } catch (e) { toast(e.message); }
    }));
  } catch (e) { box.innerHTML = `<p style="color:var(--muted)">${e.message}</p>`; }
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderNav();
  me = await requireAuth();
  if (!me) return;
  loadExplore(); loadPeople();
  let t; document.getElementById('people-search').addEventListener('input', () => { clearTimeout(t); t = setTimeout(loadPeople, 300); });
});
