Deno.serve((req) => {
  return Response.json(
    { error: 'This legacy webhook is disabled. Configure Trakteer to call the Supabase trakteer-webhook function.' },
    { status: 410 }
  );
});
