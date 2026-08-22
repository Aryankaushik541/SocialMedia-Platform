let me = null;

function qs(n) { return new URLSearchParams(location.search).get(n); }

async function loadProfile() {
  const username = qs('u');
  const wrap = document.getElementById('profile');
  if (!username) { wrap.innerHTML = '<p class="empty">No user specified.</p>'; return; }
  try {
    const { user, posts, isFollowing } = await API.get('/api/users/' + username);
    const isMe = me && (me.id === user._id || me.id === user.id);
    document.title = `${user.name} (@${user.username}) · CodeAlpha Social`;
    document.getElementById('profile-head').innerHTML = `
      <img class="avatar-lg" src="${avatarUrl(user)}">
      <div class="meta">
        <h1>${esc(user.name)}</h1>
        <div class="post-handle">@${esc(user.username)}</div>
        <p style="margin:8px 0">${esc(user.bio || '')}</p>
        <div class="profile-stats">
          <div><b>${posts.length}</b><span>Posts</span></div>
          <div><b id="followers-count">${user.followers.length}</b><span>Followers</span></div>
          <div><b>${user.following.length}</b><span>Following</span></div>
        </div>
      </div>
      <div>${isMe
        ? `<button class="btn btn-outline" id="edit-btn">Edit profile</button>`
        : `<button class="btn ${isFollowing ? 'btn-outline' : 'btn-primary'}" id="follow-btn" data-id="${user._id}">${isFollowing ? 'Following' : 'Follow'}</button>`}</div>`;

    if (isMe) {
      document.getElementById('edit-btn').addEventListener('click', () => openEdit(user));
    } else {
      const fb = document.getElementById('follow-btn');
      fb.addEventListener('click', async () => {
        try {
          const r = await API.post(`/api/users/${fb.dataset.id}/follow`);
          fb.textContent = r.following ? 'Following' : 'Follow';
          fb.className = 'btn ' + (r.following ? 'btn-outline' : 'btn-primary');
          document.getElementById('followers-count').textContent = r.followersCount;
        } catch (e) { toast(e.message); }
      });
    }

    const list = document.getElementById('profile-posts');
    if (!posts.length) { list.innerHTML = '<p class="empty">No posts yet.</p>'; return; }
    list.innerHTML = posts.map((p) => `
      <article class="card post">
        <div class="post-head"><img class="avatar" src="${avatarUrl(p.author)}">
          <div><span class="post-name">${esc(p.author.name)}</span>
          <div class="post-handle">@${esc(p.author.username)} · ${timeAgo(p.createdAt)}</div></div></div>
        <p class="post-text">${esc(p.text)}</p>
        ${p.image ? `<img class="post-img" src="${esc(p.image)}" loading="lazy">` : ''}
        <div class="post-actions"><span>❤ ${p.likesCount != null ? p.likesCount : p.likes.length}</span><span>💬 ${p.commentsCount || 0}</span></div>
      </article>`).join('');
  } catch (e) { wrap.innerHTML = `<p class="empty">${e.message}</p>`; }
}

function openEdit(user) {
  const modal = document.getElementById('edit-modal');
  modal.classList.add('show');
  const form = document.getElementById('edit-form');
  form.elements['name'].value = user.name; form.bio.value = user.bio || ''; form.avatar.value = user.avatar || '';
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/api/users/me', { name: form.elements['name'].value, bio: form.bio.value, avatar: form.avatar.value });
      modal.classList.remove('show'); toast('Profile updated'); loadProfile();
    } catch (err) { toast(err.message); }
  };
  document.getElementById('edit-cancel').onclick = () => modal.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderNav();
  me = await Auth.me();
  loadProfile();
});
