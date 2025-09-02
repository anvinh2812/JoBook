// Simple keyword/criteria extraction for IT domain
const TECH_KEYWORDS = [
  'javascript','typescript','react','reactjs','nextjs','angular','vue','svelte',
  'node','nodejs','express','nest','nestjs','graphql','rest',
  'java','spring','springboot','spring-boot',
  'python','django','flask','fastapi',
  'php','laravel','symfony',
  'c#','csharp','.net','dotnet','asp.net','aspnet',
  'c++','cpp','golang','go','rust','ruby','rails',
  'mysql','postgres','postgresql','mssql','sqlserver','mongodb','redis','elasticsearch',
  'docker','kubernetes','k8s','terraform','ansible',
  'aws','azure','gcp','cloud','devops',
  'android','ios','react native','react-native','flutter','kotlin','swift',
  'fullstack','full stack','frontend','front end','backend','back end',
  'qa','tester','data','ml','ai','nlp','dl','machine learning','deep learning'
];

const ROLE_KEYWORDS = [
  'intern','fresher','junior','middle','mid','senior','lead','leader','architect',
  'engineer','developer','dev','tester','qa','sdet','pm','product manager','scrum master'
];

const normalize = (s) => (s || '').toLowerCase();

function extractYears(text) {
  const t = normalize(text);
  // Vietnamese and English patterns
  const m = t.match(/(\d{1,2})\s*(năm|nam|yrs?|years?|y)/);
  if (m) {
    const y = parseInt(m[1], 10);
    if (!Number.isNaN(y)) return Math.min(30, Math.max(0, y));
  }
  if (/(intern|fresher)/.test(t)) return 0;
  if (/junior/.test(t)) return 1;
  if (/(middle|mid)/.test(t)) return 2;
  if (/senior/.test(t)) return 3; // 3+ years
  return null;
}

function extractTokens(text) {
  const t = normalize(text);
  const skills = new Set();
  TECH_KEYWORDS.forEach(k => { if (t.includes(k)) skills.add(k); });
  const roles = new Set();
  ROLE_KEYWORDS.forEach(k => { if (t.includes(k)) roles.add(k); });
  const years = extractYears(t);
  return { skills: Array.from(skills), roles: Array.from(roles), years };
}

function buildLikeParams(tokens) {
  // Build ILIKE patterns for SQL
  const all = [...(tokens.skills||[]), ...(tokens.roles||[])];
  // Deduplicate and create patterns like %keyword%
  const set = new Set(all);
  return Array.from(set).map(k => `%${k}%`);
}

function computeScore(text, tokens) {
  const t = normalize(text);
  let score = 0;
  (tokens.skills||[]).forEach(k => { if (t.includes(k)) score += 3; });
  (tokens.roles||[]).forEach(k => { if (t.includes(k)) score += 2; });
  if (tokens.years !== null && tokens.years !== undefined) {
    // heuristic bumps for seniority hints
    if (tokens.years === 0 && /(intern|fresher)/.test(t)) score += 2;
    if (tokens.years >= 1 && tokens.years <= 2 && /(junior|1\s*[-–to]?\s*2|1-2|1 to 2)/.test(t)) score += 2;
    if (tokens.years >= 3 && /(senior|3\+|3\s*plus|3\s*\+|\b3\b|4|5)/.test(t)) score += 2;
  }
  return score;
}

module.exports = {
  extractTokens,
  buildLikeParams,
  computeScore,
};
