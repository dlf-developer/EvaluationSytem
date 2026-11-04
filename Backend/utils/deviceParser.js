/**
 * Device Parser Utility
 * Extracts Device Type, Operating System, Browser, and Hardware Brand/Model
 * from standard HTTP User-Agent and client request headers.
 * Zero-dependency, fast, and robust.
 */

function parseUserAgent(userAgent = '', req = null) {
  const ua = String(userAgent || '').trim();

  let deviceType = 'Desktop';
  let deviceModel = 'Computer / PC';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (!ua) {
    return {
      deviceType,
      deviceModel,
      os,
      browser,
      summary: `${deviceType} • ${deviceModel} (${os} • ${browser})`,
    };
  }

  // ── 1. Device Type Detection ────────────────────────────────────────────────
  const isTablet = /iPad|PlayBook|Silk|Kindle|(Android(?!.*Mobile))/i.test(ua);
  const isMobile = !isTablet && /Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini|webOS/i.test(ua);

  if (isTablet) {
    deviceType = 'Tablet';
  } else if (isMobile) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // ── 2. Operating System Detection ───────────────────────────────────────────
  if (/iPhone OS (\d+[_.]\d+)/i.test(ua)) {
    const v = ua.match(/iPhone OS (\d+[_.]\d+)/i)[1].replace(/_/g, '.');
    os = `iOS ${v}`;
  } else if (/iPad.*OS (\d+[_.]\d+)/i.test(ua)) {
    const v = ua.match(/OS (\d+[_.]\d+)/i)[1].replace(/_/g, '.');
    os = `iPadOS ${v}`;
  } else if (/Android\s*([\d.]+)/i.test(ua)) {
    const v = ua.match(/Android\s*([\d.]+)/i)[1];
    os = `Android ${v}`;
  } else if (/Windows NT 10\.0/i.test(ua)) {
    // Windows 10 or 11 (Windows 11 shares NT 10.0 in user agent)
    os = 'Windows 10/11';
  } else if (/Windows NT 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/Mac OS X (\d+[_.0-9]*)/i.test(ua)) {
    const v = ua.match(/Mac OS X (\d+[_.0-9]*)/i)[1].replace(/_/g, '.');
    os = `macOS ${v}`;
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // ── 3. Browser & Version Detection ──────────────────────────────────────────
  if (/Edg(?:e|A|iOS)?\/(\d+[\d.]*)/i.test(ua)) {
    const v = ua.match(/Edg(?:e|A|iOS)?\/(\d+[\d.]*)/i)[1].split('.')[0];
    browser = `Edge ${v}`;
  } else if (/SamsungBrowser\/(\d+[\d.]*)/i.test(ua)) {
    const v = ua.match(/SamsungBrowser\/(\d+[\d.]*)/i)[1].split('.')[0];
    browser = `Samsung Internet ${v}`;
  } else if (/OPR\/(\d+[\d.]*)/i.test(ua)) {
    const v = ua.match(/OPR\/(\d+[\d.]*)/i)[1].split('.')[0];
    browser = `Opera ${v}`;
  } else if (/Chrome\/(\d+[\d.]*)/i.test(ua) && !/Edg/i.test(ua)) {
    const v = ua.match(/Chrome\/(\d+[\d.]*)/i)[1].split('.')[0];
    browser = `Chrome ${v}`;
  } else if (/Version\/(\d+[\d.]*).*Safari/i.test(ua)) {
    const v = ua.match(/Version\/(\d+[\d.]*)/i)[1].split('.')[0];
    browser = `Safari ${v}`;
  } else if (/Firefox\/(\d+[\d.]*)/i.test(ua)) {
    const v = ua.match(/Firefox\/(\d+[\d.]*)/i)[1].split('.')[0];
    browser = `Firefox ${v}`;
  } else if (/Safari/i.test(ua)) {
    browser = 'Safari';
  }

  // ── 4. Hardware Brand / Model Detection ─────────────────────────────────────
  if (/iPhone/i.test(ua)) {
    deviceModel = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    deviceModel = 'Apple iPad';
  } else if (/Macintosh|Mac OS/i.test(ua)) {
    deviceModel = 'Apple Mac';
  } else if (/Pixel\s*([\w\s]+?)(?:Build|\)|;)/i.test(ua)) {
    const m = ua.match(/Pixel\s*([\w\s]+?)(?:Build|\)|;)/i)[1].trim();
    deviceModel = `Google Pixel ${m}`;
  } else if (/SM-[A-Za-z0-9]+/i.test(ua)) {
    const smCode = ua.match(/SM-([A-Za-z0-9]+)/i)[0].toUpperCase();
    // Resolve famous Galaxy models
    let sub = '';
    if (smCode.startsWith('SM-S928')) sub = 'Galaxy S24 Ultra';
    else if (smCode.startsWith('SM-S921') || smCode.startsWith('SM-S926')) sub = 'Galaxy S24';
    else if (smCode.startsWith('SM-S918')) sub = 'Galaxy S23 Ultra';
    else if (smCode.startsWith('SM-S911') || smCode.startsWith('SM-S916')) sub = 'Galaxy S23';
    else if (smCode.startsWith('SM-S908')) sub = 'Galaxy S22 Ultra';
    else if (smCode.startsWith('SM-S901') || smCode.startsWith('SM-S906')) sub = 'Galaxy S22';
    else if (smCode.startsWith('SM-G998')) sub = 'Galaxy S21 Ultra';
    else if (smCode.startsWith('SM-G991')) sub = 'Galaxy S21';
    else if (smCode.startsWith('SM-A')) sub = `Galaxy A-Series (${smCode})`;
    else if (smCode.startsWith('SM-M')) sub = `Galaxy M-Series (${smCode})`;
    else if (smCode.startsWith('SM-F')) sub = `Galaxy Z Flip/Fold (${smCode})`;
    else sub = `Galaxy (${smCode})`;
    deviceModel = `Samsung ${sub}`;
  } else if (/OnePlus|ONEPLUS|CPH\d{4}/i.test(ua)) {
    deviceModel = 'OnePlus Phone';
  } else if (/Redmi|POCO|Xiaomi|220111|210911/i.test(ua)) {
    const redmiMatch = ua.match(/Redmi\s*([\w\s]+?)(?:Build|\)|;)/i);
    if (redmiMatch) {
      deviceModel = `Xiaomi Redmi ${redmiMatch[1].trim()}`;
    } else {
      deviceModel = 'Xiaomi / Redmi Phone';
    }
  } else if (/vivo|V2\d{3}/i.test(ua)) {
    deviceModel = 'Vivo Phone';
  } else if (/OPPO/i.test(ua)) {
    deviceModel = 'OPPO Phone';
  } else if (/Realme|RMX\d{4}/i.test(ua)) {
    deviceModel = 'Realme Phone';
  } else if (/Motorola|moto/i.test(ua)) {
    deviceModel = 'Motorola Phone';
  } else if (deviceType === 'Desktop') {
    if (os.includes('Windows')) deviceModel = 'Windows PC';
    else if (os.includes('macOS')) deviceModel = 'Apple Mac';
    else if (os.includes('Linux')) deviceModel = 'Linux Desktop';
    else deviceModel = 'Desktop Computer';
  } else if (deviceType === 'Mobile') {
    deviceModel = os.includes('Android') ? 'Android Smartphone' : 'Mobile Phone';
  } else if (deviceType === 'Tablet') {
    deviceModel = os.includes('Android') ? 'Android Tablet' : 'Tablet Device';
  }

  const summary = `${deviceType} • ${deviceModel} (${os} • ${browser})`;

  return {
    deviceType,
    deviceModel,
    os,
    browser,
    summary,
  };
}

module.exports = {
  parseUserAgent,
};

