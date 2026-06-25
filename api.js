// api.js — Client-side API caller
// เปลี่ยนจากส่ง request ตรงไป Netlify Functions ผ่าน API route

const API_BASE = '/.netlify/functions';

// ============ Life Copilot ============
async function callLifeCopilot(message, history, profile) {
  const response = await fetch(`${API_BASE}/life-copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, profile })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  const data = await response.json();
  return data.reply;
}

// ============ Life Coach Report ============
async function generateLifeCoachReport(profile) {
  const response = await fetch(`${API_BASE}/life-coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  const data = await response.json();
  return data.script;
}

// ============ Natal Chart (ถ้ายังใช้ API ภายนอก) ============
async function fetchNatalChart(dob, time, place) {
  const response = await fetch(`${API_BASE}/natal-chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dob, time, place })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Natal chart API error');
  }

  const data = await response.json();
  return data;
}
