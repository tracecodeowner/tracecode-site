import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Extract IP
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp) || 'unknown';

    // Parse user-agent for device/browser
    const ua = req.headers.get('user-agent') || '';
    let browser = 'Unknown';
    let device = 'Desktop';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR\//i.test(ua)) browser = 'Opera';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua)) browser = 'Safari';
    if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile';
    else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';

    // Geo-locate country from IP (free API, fail silently)
    let country = user.country || '';
    if (ip !== 'unknown' && !country) {
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 3000);
        const geoRes = await fetch(`https://ipapi.co/${ip}/country/`, { signal: ctrl.signal });
        if (geoRes.ok) country = (await geoRes.text()).trim();
      } catch { /* ignore geo errors */ }
    }

    await base44.asServiceRole.entities.User.update(user.id, {
      lastLoginDate: new Date().toISOString(),
      lastIP: ip,
      device,
      browser,
      country: country || undefined,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});