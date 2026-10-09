import { preflight, authenticateApiKey, corsHeaders } from '../../shared/apiAuth.js';
import { getFields } from '../../shared/jurisdictions.js';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { error } = await authenticateApiKey(req);
    if (error) return error;

    const url = new URL(req.url);
    const jurisdictionCode = url.searchParams.get('jurisdiction') || 'NV';
    const profileKey = url.searchParams.get('profile') || 'scandit';
    const detail = url.searchParams.get('detail') || 'brief';

    const { fields, jurisdiction, profile } = getFields(jurisdictionCode, profileKey);

    if (detail === 'full') {
      return Response.json({
        success: true,
        jurisdiction: {
          code: jurisdiction.code,
          name: jurisdiction.name,
          iin: jurisdiction.iin,
          aamvaVersion: jurisdiction.aamvaVersion,
          jurisdictionVersion: jurisdiction.jurisdictionVersion,
          revision: jurisdiction.revision,
        },
        profile: {
          key: profile.key,
          name: profile.name,
          eclevel: profile.eclevel,
          description: profile.description,
        },
        fields: fields.map(f => ({
          fieldId: f.fieldId,
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required,
          maxLength: f.maxLength,
          helpText: f.helpText,
          options: f.options,
          validator: f.validator,
          autoFill: f.autoFill,
        })),
      }, { headers: corsHeaders });
    }

    return Response.json({
      success: true,
      jurisdiction: { code: jurisdiction.code, name: jurisdiction.name },
      profile: profileKey,
      fields: fields.map(f => ({
        fieldId: f.fieldId,
        name: f.name,
        required: f.required,
      })),
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});