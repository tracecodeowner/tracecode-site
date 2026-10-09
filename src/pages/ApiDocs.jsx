import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Code2, Copy, Check, Key, Zap, Loader2, Lock, BookOpen, Server, Globe, AlertTriangle } from 'lucide-react';
import CodeTabs from '@/components/apidocs/CodeTabs';

const BASE_URL = 'https://tracecode.shop';

export default function ApiDocs() {
  const { user, checkUserAuth } = useAuth();
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('auth');

  useEffect(() => {
    setApiKey(user?.apiKey || '');
  }, [user]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('setupProfile', {});
      setApiKey(res.data.apiKey);
      if (checkUserAuth) checkUserAuth(true);
    } catch (e) { /* ignore */ }
    finally { setGenerating(false); }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const navItems = [
    { id: 'auth', label: 'Authentication', icon: Lock },
    { id: 'account', label: 'Get Account Info', icon: Server },
    { id: 'states', label: 'Get Available States', icon: Globe },
    { id: 'fields-brief', label: 'Get Barcode Fields (Brief)', icon: Code2 },
    { id: 'fields-full', label: 'Get Barcode Fields (Full)', icon: Code2 },
    { id: 'create', label: 'Create Barcode', icon: Zap },
    { id: 'errors', label: 'Errors', icon: AlertTriangle },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-accent" />
          <h1 className="text-3xl font-heading font-bold tracking-tight">API Documentation</h1>
        </div>
        <p className="text-sm text-muted-foreground">Generate AAMVA PDF417 barcodes programmatically. All endpoints use your API key for authentication.</p>
      </motion.div>

      {/* API Key section */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-bold tracking-tight">Your API Key</h2>
        </div>
        {apiKey ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
            <code className="flex-1 text-xs font-mono text-accent break-all">{apiKey}</code>
            <button onClick={() => handleCopy(apiKey)} className="text-muted-foreground hover:text-foreground shrink-0">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-3">No API key yet. Generate one to start using the API.</p>
            <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider mx-auto">
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              GENERATE API KEY
            </button>
          </div>
        )}
        <div className="mt-3 text-[10px] text-destructive/70">⚠ Keep your API key secret. Do not share it publicly.</div>
      </div>

      {/* Base URL */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-8">
        <h2 className="text-sm font-bold tracking-tight mb-3">Base URL</h2>
        <code className="text-xs font-mono text-accent">{BASE_URL}</code>
        <p className="text-[11px] text-muted-foreground mt-2">All endpoints are prefixed with <code className="text-accent">/api/functions/</code></p>
      </div>

      {/* Authentication overview */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-bold tracking-tight">Authentication</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">All API requests require your API key in the <code className="text-accent">X-API-Key</code> header. Get your key from the section above or from your Profile page.</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
              <th className="pb-2">HEADER</th>
              <th className="pb-2">VALUE</th>
              <th className="pb-2">REQUIRED</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30">
              <td className="py-2 font-mono text-accent">X-API-Key</td>
              <td className="py-2 font-mono text-muted-foreground">Your API key (tc_live_...)</td>
              <td className="py-2 text-accent">✓ Yes</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-accent">Content-Type</td>
              <td className="py-2 font-mono text-muted-foreground">application/json</td>
              <td className="py-2 text-muted-foreground">POST only</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Get Account Info */}
      <Section id="account" title="Get Account Info" description="Returns detailed account information including credits, email, and referral stats." method="GET" endpoint="/api/functions/accountInfoApi">
        <CodeTabs apiKey={apiKey} examples={[
          { lang: 'shell', label: 'cURL', code: `curl -X GET ${BASE_URL}/api/functions/accountInfoApi \\
  -H "X-API-Key: YOUR_API_KEY"` },
          { lang: 'python', code: `import requests

response = requests.get(
    "${BASE_URL}/api/functions/accountInfoApi",
    headers={"X-API-Key": "YOUR_API_KEY"}
)

data = response.json()
print("Email:", data["email"])
print("Credits:", data["credits"])
print("Referral code:", data["referralCode"])` },
          { lang: 'javascript', code: `const response = await fetch("${BASE_URL}/api/functions/accountInfoApi", {
  method: "GET",
  headers: { "X-API-Key": "YOUR_API_KEY" }
});

const data = await response.json();
console.log("Email:", data.email);
console.log("Credits:", data.credits);` },
          { lang: 'php', code: `<?php
$ch = curl_init("${BASE_URL}/api/functions/accountInfoApi");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: YOUR_API_KEY"]);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo "Email: " . $data["email"] . "\\n";
echo "Credits: " . $data["credits"] . "\\n";` },
        ]} />
        <ResponseExample title="Response" json={`{
  "success": true,
  "email": "user@example.com",
  "role": "user",
  "credits": 50,
  "apiKey": "tc_live_...",
  "referralCode": "ABC123",
  "referralBalance": 5.00,
  "referralCount": 3,
  "referralEarned": 12.50,
  "createdDate": "2026-01-15T10:30:00Z"
}`} />
      </Section>

      {/* Get Available States */}
      <Section id="states" title="Get Available States" description="Retrieves all available US states with their 2-letter codes, IIN numbers, and document revisions. Use the state code for the fields and create endpoints." method="GET" endpoint="/api/functions/statesApi">
        <CodeTabs apiKey={apiKey} examples={[
          { lang: 'shell', label: 'cURL', code: `curl -X GET ${BASE_URL}/api/functions/statesApi \\
  -H "X-API-Key: YOUR_API_KEY"` },
          { lang: 'python', code: `import requests

response = requests.get(
    "${BASE_URL}/api/functions/statesApi",
    headers={"X-API-Key": "YOUR_API_KEY"}
)

data = response.json()
for state in data["states"]:
    print(f'{state["code"]} - {state["name"]} (IIN: {state["iin"]}, Rev: {state["revision"]})')` },
          { lang: 'javascript', code: `const response = await fetch("${BASE_URL}/api/functions/statesApi", {
  method: "GET",
  headers: { "X-API-Key": "YOUR_API_KEY" }
});

const data = await response.json();
data.states.forEach(s => {
  console.log(\`\${s.code} - \${s.name} (IIN: \${s.iin})\`);
});` },
          { lang: 'php', code: `<?php
$ch = curl_init("${BASE_URL}/api/functions/statesApi");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: YOUR_API_KEY"]);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
foreach ($data["states"] as $state) {
    echo $state["code"] . " - " . $state["name"] . " (IIN: " . $state["iin"] . ")\\n";
}` },
        ]} />
        <ResponseExample title="Response" json={`{
  "success": true,
  "count": 51,
  "states": [
    { "code": "AL", "name": "Alabama", "iin": "636033", "aamvaVersion": "10", "jurisdictionVersion": "0403", "revision": "Rev. 01/01/2022 (0403)" },
    { "code": "AK", "name": "Alaska", "iin": "636059", "aamvaVersion": "10", "jurisdictionVersion": "0901", "revision": "Rev. 01/01/2021 (0901)" },
    ...
  ]
}`} />
      </Section>

      {/* Get Barcode Fields (Brief) */}
      <Section id="fields-brief" title="Get Barcode Fields (Brief)" description="Retrieves the required fields for a specific state and profile, along with their field IDs. Use this to know which fields to pass to the Create Barcode endpoint." method="GET" endpoint="/api/functions/fieldsApi?jurisdiction=NV&profile=scandit&detail=brief">
        <ParamsTable params={[
          { name: 'jurisdiction', type: 'string', required: 'No', description: '2-letter state code (default: NV)' },
          { name: 'profile', type: 'string', required: 'No', description: 'Profile key: scandit, showme-id, or fidscan (default: scandit)' },
          { name: 'detail', type: 'string', required: 'No', description: 'Set to "brief" or "full" (default: brief)' },
        ]} />
        <CodeTabs apiKey={apiKey} examples={[
          { lang: 'shell', label: 'cURL', code: `curl -X GET "${BASE_URL}/api/functions/fieldsApi?jurisdiction=NV&profile=scandit&detail=brief" \\
  -H "X-API-Key: YOUR_API_KEY"` },
          { lang: 'python', code: `import requests

response = requests.get(
    "${BASE_URL}/api/functions/fieldsApi",
    params={"jurisdiction": "NV", "profile": "scandit", "detail": "brief"},
    headers={"X-API-Key": "YOUR_API_KEY"}
)

data = response.json()
for field in data["fields"]:
    req = " (required)" if field["required"] else ""
    print(f'{field["fieldId"]} -> {field["name"]}{req}')` },
          { lang: 'javascript', code: `const url = new URL("${BASE_URL}/api/functions/fieldsApi");
url.searchParams.set("jurisdiction", "NV");
url.searchParams.set("profile", "scandit");
url.searchParams.set("detail", "brief");

const response = await fetch(url, {
  method: "GET",
  headers: { "X-API-Key": "YOUR_API_KEY" }
});

const data = await response.json();
data.fields.forEach(f => {
  console.log(\`\${f.fieldId} -> \${f.name}\${f.required ? " (required)" : ""}\`);
});` },
          { lang: 'php', code: `<?php
$ch = curl_init("${BASE_URL}/api/functions/fieldsApi?jurisdiction=NV&profile=scandit&detail=brief");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: YOUR_API_KEY"]);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
foreach ($data["fields"] as $field) {
    $req = $field["required"] ? " (required)" : "";
    echo $field["fieldId"] . " -> " . $field["name"] . $req . "\\n";
}` },
        ]} />
        <ResponseExample title="Response" json={`{
  "success": true,
  "jurisdiction": { "code": "NV", "name": "Nevada" },
  "profile": "scandit",
  "fields": [
    { "fieldId": "DCS", "name": "lastName", "required": true },
    { "fieldId": "DAC", "name": "firstName", "required": true },
    { "fieldId": "DAQ", "name": "dlNumber", "required": true },
    ...
  ]
}`} />
      </Section>

      {/* Get Barcode Fields (Full) */}
      <Section id="fields-full" title="Get Barcode Fields (Full)" description="Retrieves the complete field definitions including type, max length, options, validators, and help text. Use this for building dynamic forms." method="GET" endpoint="/api/functions/fieldsApi?jurisdiction=NV&profile=scandit&detail=full">
        <ParamsTable params={[
          { name: 'jurisdiction', type: 'string', required: 'Yes', description: '2-letter state code (e.g. NV, CA, TX)' },
          { name: 'profile', type: 'string', required: 'No', description: 'Profile key (default: scandit)' },
          { name: 'detail', type: 'string', required: 'Yes', description: 'Must be set to "full"' },
        ]} />
        <CodeTabs apiKey={apiKey} examples={[
          { lang: 'shell', label: 'cURL', code: `curl -X GET "${BASE_URL}/api/functions/fieldsApi?jurisdiction=NV&profile=scandit&detail=full" \\
  -H "X-API-Key: YOUR_API_KEY"` },
          { lang: 'python', code: `import requests

response = requests.get(
    "${BASE_URL}/api/functions/fieldsApi",
    params={"jurisdiction": "NV", "profile": "scandit", "detail": "full"},
    headers={"X-API-Key": "YOUR_API_KEY"}
)

data = response.json()
for field in data["fields"]:
    print(f'{field["fieldId"]} ({field["name"]}): type={field["type"]}, required={field["required"]}, maxLen={field.get("maxLength")}')` },
          { lang: 'javascript', code: `const url = new URL("${BASE_URL}/api/functions/fieldsApi");
url.searchParams.set("jurisdiction", "NV");
url.searchParams.set("profile", "scandit");
url.searchParams.set("detail", "full");

const response = await fetch(url, {
  method: "GET",
  headers: { "X-API-Key": "YOUR_API_KEY" }
});

const data = await response.json();
data.fields.forEach(f => {
  console.log(\`\${f.fieldId} (\${f.name}): type=\${f.type}, required=\${f.required}\`);
});` },
          { lang: 'php', code: `<?php
$ch = curl_init("${BASE_URL}/api/functions/fieldsApi?jurisdiction=NV&profile=scandit&detail=full");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: YOUR_API_KEY"]);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
foreach ($data["fields"] as $field) {
    echo $field["fieldId"] . " (" . $field["name"] . "): type=" . $field["type"] . "\\n";
}` },
        ]} />
        <ResponseExample title="Response" json={`{
  "success": true,
  "jurisdiction": { "code": "NV", "name": "Nevada", "iin": "636049", "aamvaVersion": "10", "jurisdictionVersion": "1000" },
  "profile": { "key": "scandit", "name": "Scandit", "eclevel": 5 },
  "fields": [
    {
      "fieldId": "DAQ",
      "name": "dlNumber",
      "label": "DL Number",
      "type": "text",
      "required": true,
      "maxLength": 25,
      "helpText": "Customer Number / Driver License Number"
    },
    {
      "fieldId": "DBC",
      "name": "sex",
      "label": "Sex",
      "type": "select",
      "required": true,
      "options": [
        { "value": "1", "label": "Male" },
        { "value": "2", "label": "Female" }
      ]
    },
    ...
  ]
}`} />
      </Section>

      {/* Create Barcode */}
      <Section id="create" title="Create Barcode" description="Creates an AAMVA PDF417 barcode payload. Pass the form data, jurisdiction code, and profile. Each call costs 1 credit. The payload field contains the raw AAMVA string — pass it to your PDF417 renderer." method="POST" endpoint="/api/functions/generateBarcodeApi">
        <div className="mb-4">
          <h3 className="text-xs font-bold tracking-widest text-muted-foreground mb-2">JSON DATA PARAMETERS</h3>
          <ParamsTable params={[
            { name: 'formData', type: 'object', required: 'Yes', description: 'Driver license field data (use the Fields endpoint to see required fields)' },
            { name: 'jurisdictionCode', type: 'string', required: 'Yes', description: '2-letter state code (e.g. "NV")' },
            { name: 'profileKey', type: 'string', required: 'Yes', description: '"scandit", "showme-id", or "fidscan"' },
            { name: 'options', type: 'object', required: 'No', description: '{ eclevel: 0-8, scale: 1-10 }' },
          ]} />
        </div>
        <CodeTabs apiKey={apiKey} examples={[
          { lang: 'shell', label: 'cURL', code: `curl -X POST ${BASE_URL}/api/functions/generateBarcodeApi \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "formData": {
      "dlNumber": "NV1234567",
      "lastName": "SMITH",
      "firstName": "JOHN",
      "address": "123 MAIN ST",
      "city": "LAS VEGAS",
      "state": "NV",
      "zipCode": "89101",
      "country": "USA",
      "birthDate": "01151985",
      "issueDate": "07242023",
      "expiryDate": "07242031",
      "sex": "1"
    },
    "jurisdictionCode": "NV",
    "profileKey": "scandit",
    "options": { "eclevel": 5, "scale": 3 }
  }'` },
          { lang: 'python', code: `import requests

response = requests.post(
    "${BASE_URL}/api/functions/generateBarcodeApi",
    headers={
        "Content-Type": "application/json",
        "X-API-Key": "YOUR_API_KEY"
    },
    json={
        "formData": {
            "dlNumber": "NV1234567",
            "lastName": "SMITH",
            "firstName": "JOHN",
            "address": "123 MAIN ST",
            "city": "LAS VEGAS",
            "state": "NV",
            "zipCode": "89101",
            "country": "USA",
            "birthDate": "01151985",
            "issueDate": "07242023",
            "expiryDate": "07242031",
            "sex": "1"
        },
        "jurisdictionCode": "NV",
        "profileKey": "scandit",
        "options": {"eclevel": 5, "scale": 3}
    }
)

data = response.json()
print("Payload:", data["payload"])
print("Remaining credits:", data["remainingCredits"])` },
          { lang: 'javascript', code: `const response = await fetch("${BASE_URL}/api/functions/generateBarcodeApi", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    formData: {
      dlNumber: "NV1234567",
      lastName: "SMITH",
      firstName: "JOHN",
      address: "123 MAIN ST",
      city: "LAS VEGAS",
      state: "NV",
      zipCode: "89101",
      country: "USA",
      birthDate: "01151985",
      issueDate: "07242023",
      expiryDate: "07242031",
      sex: "1"
    },
    jurisdictionCode: "NV",
    profileKey: "scandit",
    options: { eclevel: 5, scale: 3 }
  })
});

const data = await response.json();
console.log("Payload:", data.payload);
console.log("Remaining credits:", data.remainingCredits);` },
          { lang: 'php', code: `<?php
$ch = curl_init("${BASE_URL}/api/functions/generateBarcodeApi");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-API-Key: YOUR_API_KEY"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "formData" => [
        "dlNumber" => "NV1234567",
        "lastName" => "SMITH",
        "firstName" => "JOHN",
        "address" => "123 MAIN ST",
        "city" => "LAS VEGAS",
        "state" => "NV",
        "zipCode" => "89101",
        "country" => "USA",
        "birthDate" => "01151985",
        "issueDate" => "07242023",
        "expiryDate" => "07242031",
        "sex" => "1"
    ],
    "jurisdictionCode" => "NV",
    "profileKey" => "scandit",
    "options" => ["eclevel" => 5, "scale" => 3]
]));
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo "Payload: " . $data["payload"] . "\\n";
echo "Remaining credits: " . $data["remainingCredits"] . "\\n";` },
        ]} />
        <ResponseExample title="Response" json={`{
  "success": true,
  "payload": "@\\n\\u001e\\rANSI 636049101001DL0031...",
  "header": {
    "complianceIndicator": "@",
    "fileType": "ANSI ",
    "iin": "636049",
    "aamvaVersion": "10",
    "jurisdictionVersion": "1000",
    "numberOfEntries": 1
  },
  "stats": {
    "totalPayloadLength": 232,
    "dlSubfileLength": 201,
    "dlOffset": 31
  },
  "remainingCredits": 9
}`} />
        <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20 text-[11px] text-muted-foreground">
          💡 Each API call costs <span className="text-accent font-bold">1 credit</span>. The <code className="text-accent">payload</code> field contains the raw AAMVA string with control characters — pass it to your PDF417 renderer.
        </div>
      </Section>

      {/* Errors */}
      <Section id="errors" title="Errors" description="The API uses standard HTTP status codes. Error responses include a message in the body." method="" endpoint="">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
              <th className="pb-2">CODE</th>
              <th className="pb-2">MEANING</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30">
              <td className="py-2 font-mono text-accent">200</td>
              <td className="py-2 text-muted-foreground">Success — request completed</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 font-mono text-accent">400</td>
              <td className="py-2 text-muted-foreground">Bad Request — missing or invalid parameters</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 font-mono text-accent">401</td>
              <td className="py-2 text-muted-foreground">Unauthorized — missing or invalid API key</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 font-mono text-accent">403</td>
              <td className="py-2 text-muted-foreground">Forbidden — insufficient credits or account banned/suspended</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-accent">500</td>
              <td className="py-2 text-muted-foreground">Server Error — internal error</td>
            </tr>
          </tbody>
        </table>
        <ResponseExample title="Error Response Example" json={`{
  "error": "Insufficient credits",
  "code": "INSUFFICIENT_CREDITS",
  "required": 1,
  "available": 0
}`} />
      </Section>
    </div>
  );
}

function Section({ id, title, description, method, endpoint, children }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-border bg-card/50 p-6 mb-6 scroll-mt-6"
    >
      <h2 className="text-lg font-heading font-bold tracking-tight mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {method && endpoint && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border mb-4">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-accent/20 text-accent'}`}>{method}</span>
          <code className="text-xs font-mono text-muted-foreground break-all">{endpoint}</code>
        </div>
      )}
      {children}
    </motion.div>
  );
}

function ParamsTable({ params }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold tracking-widest text-muted-foreground mb-2">QUERY PARAMETERS</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
            <th className="pb-2">PARAMETER</th>
            <th className="pb-2">TYPE</th>
            <th className="pb-2">REQUIRED</th>
            <th className="pb-2">DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-b border-border/30">
              <td className="py-2 font-mono text-accent">{p.name}</td>
              <td className="py-2 text-muted-foreground">{p.type}</td>
              <td className="py-2">{p.required === 'Yes' ? <span className="text-accent">✓</span> : <span className="text-muted-foreground">—</span>}</td>
              <td className="py-2 text-muted-foreground">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResponseExample({ title, json }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold tracking-widest text-muted-foreground">{title.toUpperCase()}</h3>
        <button
          onClick={() => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 rounded-lg bg-secondary/30 border border-border text-[11px] font-mono overflow-x-auto scrollbar-thin text-foreground/80">{json}</pre>
    </div>
  );
}