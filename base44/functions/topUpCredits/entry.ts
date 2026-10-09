Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  return Response.json(
    { error: 'Credits can only be added after a verified payment.' },
    { status: 410 }
  );
});