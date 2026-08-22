const API = {
  async request(url, options = {}) {
    let res;
    try {
      res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
    } catch (netErr) {
      // fetch itself failed => server unreachable / network down (NOT an auth problem)
      const e = new Error('Cannot reach the server. Is it running?');
      e.status = 0; e.network = true;
      throw e;
    }
    let data = null; try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const msg = (data && (data.message || (data.errors && data.errors[0] && data.errors[0].msg))) || 'Request failed';
      const e = new Error(msg);
      e.status = res.status; e.data = data;
      throw e;
    }
    return data;
  },
  get(u){return this.request(u);},
  post(u,b){return this.request(u,{method:'POST',body:JSON.stringify(b||{})});},
  put(u,b){return this.request(u,{method:'PUT',body:JSON.stringify(b||{})});},
  del(u){return this.request(u,{method:'DELETE'});},
};
function toast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}
function timeAgo(d){const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+'s';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d';}
function esc(str){const d=document.createElement('div');d.textContent=str==null?'':str;return d.innerHTML;}
function avatarUrl(u){return u&&u.avatar?u.avatar:`https://ui-avatars.com/api/?name=${encodeURIComponent(u?u.name:'User')}&background=1d9bf0&color=fff`;}
