const Auth = {
  _me: undefined,
  async me() {
    if (this._me !== undefined) return this._me;
    try {
      const d = await API.get('/api/auth/me');
      this._me = d.user;
      return this._me;
    } catch (e) {
      // Only a genuine 401 means "not logged in". A network error or a 5xx
      // (e.g. the server restarted/crashed) must NOT be treated as a logout —
      // otherwise every click after a hiccup would bounce the user to /login.
      if (e && e.status === 401) { this._me = null; return this._me; }
      throw e; // leave _me undefined so the next call retries
    }
  },
  async logout() { try { await API.post('/api/auth/logout'); } catch (_) {} location.href = '/login.html'; },
};

async function renderNav() {
  const links = document.getElementById('nav-links');
  if (!links) return;
  let user = null;
  try { user = await Auth.me(); }
  catch (_) { return; } // transient server/network error: leave the nav as-is, don't flip to logged-out
  if (user) {
    links.innerHTML = `
      <a href="/">Home</a>
      <a href="/explore.html">Explore</a>
      <a href="/profile.html?u=${user.username}">Profile</a>
      <img class="avatar-sm" src="${avatarUrl(user)}" alt="me">
      <button class="btn btn-outline btn-sm" id="logout-btn">Logout</button>`;
    const lb = document.getElementById('logout-btn');
    if (lb) lb.addEventListener('click', () => Auth.logout());
  } else {
    links.innerHTML = `<a href="/login.html">Login</a><a class="btn btn-primary btn-sm" href="/register.html">Sign up</a>`;
  }
}

// Redirect to login if not authenticated (for protected pages)
async function requireAuth() {
  let user;
  try {
    user = await Auth.me();
  } catch (e) {
    // Server unreachable / crashed — don't pretend the user is logged out.
    toast('Server not reachable. Make sure it is running, then refresh.');
    return null;
  }
  if (!user) { location.href = '/login.html?redirect=' + encodeURIComponent(location.pathname + location.search); return null; }
  return user;
}
