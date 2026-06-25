async function fetchNatalChart(force) {
  const p = lsG(LSP) || {};
  if (!p.dob) { toast('กรุณากรอกวันเกิดในโปรไฟล์ก่อน'); return; }

  const cached = lsG(LSN);
  if (!force && cached && cached.dob === p.dob && cached.time === (p.time || '') && cached.place === (p.place || '')) {
    rNatal(cached);
    return;
  }

  // แสดง loading state
  const idle = document.getElementById('natal-idle');
  const loading = document.getElementById('natal-loading');
  const errEl = document.getElementById('natal-error');
  const content = document.getElementById('natal-content');

  if (idle) idle.style.display = 'none';
  if (errEl) errEl.style.display = 'none';
  if (content) content.style.display = 'none';
  if (loading) loading.style.display = 'block';

  try {
    const data = await fetchNatalChart(p.dob, p.time || '', p.place || '');
    data.dob = p.dob;
    data.time = p.time || '';
    data.place = p.place || '';
    data.fetchedAt = new Date().toISOString();
    lsS(LSN, data);
    rNatal(data);
  } catch (e) {
    if (loading) loading.style.display = 'none';
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = 'ไม่สามารถคำนวณดวงได้: ' + e.message;
    }
    if (idle) idle.style.display = 'block';
  }
}
