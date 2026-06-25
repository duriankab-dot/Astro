// api.js — Client-side API caller
// ใช้ DeepSeek API แทน OpenAI

const API_BASE = '/.netlify/functions';

// ============ Life Copilot ============
async function callLifeCopilot(message, history, profile) {
  try {
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
  } catch (error) {
    console.error('❌ Life Copilot API error:', error);
    throw error;
  }
}

// ============ Life Coach Report ============
async function generateLifeCoachReport(profile) {
  try {
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
  } catch (error) {
    console.error('❌ Life Coach API error:', error);
    throw error;
  }
}

// ============ Natal Chart ============
async function fetchNatalChart(dob, time, place) {
  try {
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
  } catch (error) {
    console.error('❌ Natal chart API error:', error);
    throw error;
  }
}
