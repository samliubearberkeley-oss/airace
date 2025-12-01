import { insforge } from './insforge';

// Generate or retrieve a unique visitor ID
function getVisitorId(): string {
  const storageKey = 'ai_maze_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    // Generate a random UUID-like ID
    visitorId = 'v_' + crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

// Track page visit
export async function trackVisit(): Promise<void> {
  try {
    const visitorId = getVisitorId();
    
    const visitData = {
      visitor_id: visitorId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      page_url: window.location.href,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      language: navigator.language,
      platform: navigator.platform,
    };

    await insforge.database
      .from('visits')
      .insert(visitData);
    
    // Silent - no console logs for production
  } catch {
    // Silently fail - don't affect user experience
  }
}

