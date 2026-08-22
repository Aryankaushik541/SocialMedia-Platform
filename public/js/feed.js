let me = null;

function postHTML(p) {
  const liked = me && p.likes && p.likes.some((id) => id === me.id || id === me._id);
  return `<article class="card post" data-id="${p._id}">
    <div class="post-head">
      <a href="/profile.html?u=${p.author.username}"><img class="avatar" src="${avatarUrl(p.author)}"></a>
      <div>
        <a href="/profile.html?u=${p.author.username}" class="post-name">${esc(p.author.name)}</a>
        <div class="post-handle">@${esc(p.author.username)} · <span class="post-time">${timeAgo(p.createdAt)}</span></div>
      </div>
      ${me && (p.author._id === me.id || p.author.id === me.id) ? `<button class="btn btn-outline btn-sm" data-del style="margin-left:auto">Delete</button>` : ''}
    </div>
    <p class="post-text">${esc(p.text)}</p>
    ${p.image ? `<img class="post-img" src="${esc(p.image)}" alt="post image" loading="lazy">` : ''}
    <div class="post-actions">
      <button data-like class="${liked ? 'liked' : ''}">❤ <span data-likes>${p.likesCount != null ? p.likesCount : (p.likes ? p.likes.length : 0)}</span></button>
      <button data-toggle-comments>💬 <span data-cc>${p.commentsCount || 0}</span></button>
    </div>
    <div class="comments" data-comments style="display:none"></div>
  </article>`;
}

function wirePost(el) {
  const id = el.dataset.id;
  const likeBtn = el.querySelector('[data-like]');
  likeBtn.addEventListener('click', async () => {
    try {
      const r = await API.post(`/api/posts/${id}/like`);
      likeBtn.classList.toggle('liked', r.liked);
      likeBtn.querySelector('[data-likes]').textContent = r.likesCount;
    } catch (e) { toast(e.message); }
  });
  const delBtn = el.querySelector('[data-del]');
  if (delBtn) delBtn.addEventListener('click', async () => {
    if (!confirm('Delete this post?')) return;
    try { await API.del(`/api/posts/${id}`); el.remove(); toast('Post deleted'); } catch (e) { toast(e.message); }
  });
  const cBtn = el.querySelector('[data-toggle-comments]');
  const cBox = el.querySelector('[data-comments]');
  cBtn.addEventListener('click', () => toggleComments(id, cBox));
}

async function toggleComments(id, box) {
  if (box.style.display === 'block') { box.style.display = 'none'; return; }
  box.style.display = 'block';
  box.innerHTML = '<p style="color:var(--muted);font-size:14px">Loading…</p>';
  try {
    const { comments } = await API.get(`/api/posts/${id}/comments`);
    box.innerHTML = comments.map((c) => `
      <div class="comment"><img class="avatar-sm" src="${avatarUrl(c.author)}">
        <div class="body"><strong>${esc(c.author.name)}</strong> <span style="color:var(--muted);font-size:12px">@${esc(c.author.username)}</span>
        <p>${esc(c.text)}</p></div></div>`).join('') +
      `<form class="comment-form"><input placeholder="Write a comment…" maxlength="500" required><button class="btn btn-primary btn-sm">Reply</button></form>`;
    const form = box.querySelector('.comment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      try {
        await API.post(`/api/posts/${id}/comments`, { text: input.value });
        const cc = document.querySelector(`[data-id="${id}"] [data-cc]`);
        if (cc) cc.textContent = Number(cc.textContent) + 1;
        toggleComments(id, box); toggleComments(id, box); // refresh
      } catch (err) { toast(err.message); }
    });
  } catch (e) { box.innerHTML = `<p style="color:var(--muted)">${e.message}</p>`; }
}

async function loadFeed() {
  const feed = document.getElementById('feed');
  feed.innerHTML = '<p class="empty">Loading feed…</p>';
  try {
    const { posts } = await API.get('/api/posts');
    if (!posts.length) { feed.innerHTML = '<p class="empty">Your feed is empty. Follow people from <a href="/explore.html">Explore</a> or write your first post!</p>'; return; }
    feed.innerHTML = posts.map(postHTML).join('');
    feed.querySelectorAll('.post').forEach(wirePost);
  } catch (e) { feed.innerHTML = `<p class="empty">${e.message}</p>`; }
}

async function loadSuggestions() {
  const box = document.getElementById('suggestions');
  if (!box) return;
  try {
    const { users } = await API.get('/api/users/me/suggestions');
    if (!users.length) { box.innerHTML = '<p style="color:var(--muted);font-size:14px">No suggestions right now.</p>'; return; }
    box.innerHTML = users.map((u) => `
      <div class="suggestion"><img class="avatar" src="${avatarUrl(u)}">
        <div class="info"><strong>${esc(u.name)}</strong><span>@${esc(u.username)}</span></div>
        <button class="btn btn-primary btn-sm" data-follow="${u._id}">Follow</button></div>`).join('');
    box.querySelectorAll('[data-follow]').forEach((btn) => btn.addEventListener('click', async () => {
      try { const r = await API.post(`/api/users/${btn.dataset.follow}/follow`); btn.textContent = r.following ? 'Following' : 'Follow'; btn.disabled = r.following; if (r.following) loadFeed(); } catch (e) { toast(e.message); }
    }));
  } catch (e) { /* ignore */ }
}

async function initComposer() {
  const form = document.getElementById('composer-form');
  if (!form) return;
  document.getElementById('composer-avatar').src = avatarUrl(me);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = form.text.value.trim();
    const image = form.image.value.trim();
    if (!text) return;
    try {
      await API.post('/api/posts', { text, image });
      form.reset(); loadFeed(); toast('Posted!');
    } catch (err) { toast(err.message); }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderNav();
  me = await requireAuth();
  if (!me) return;
  initComposer(); loadFeed(); loadSuggestions();
});
