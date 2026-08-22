function qs(n){return new URLSearchParams(location.search).get(n);}
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const login = document.getElementById('login-form');
  if (login) login.addEventListener('submit', async (e) => {
    e.preventDefault(); const msg = document.getElementById('msg'); msg.innerHTML = '';
    try { await API.post('/api/auth/login', { email: login.email.value, password: login.password.value }); location.href = qs('redirect') || '/'; }
    catch (err) { msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  });
  const reg = document.getElementById('register-form');
  if (reg) reg.addEventListener('submit', async (e) => {
    e.preventDefault(); const msg = document.getElementById('msg'); msg.innerHTML = '';
    try { await API.post('/api/auth/register', { name: reg.elements['name'].value, username: reg.username.value, email: reg.email.value, password: reg.password.value }); location.href = '/'; }
    catch (err) { msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  });
});
