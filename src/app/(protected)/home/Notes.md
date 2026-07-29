Part A — SymptomLogList improvements:

Replace the emoji 📝 affordance with a proper notes icon
Give each log entry a left accent strip color-coded by severity (green/amber/rose) — matching the SeverityPicker color bands from the log form
Replace the plain "Severity X/10" badge with the same pill style established elsewhere
Make the date group headers feel more intentional (pill badge, thinner divider line)
Remove the raw "ID X" from the meta line — that's implementation detail, not user-facing info
Notes block to match the card style from UserMedicationList

Part B — Tabs on page.tsx:

Since page.tsx is a Server Component, the tab state needs a "use client" wrapper component. I'll create a HomeTabs client component that receives both data sets as props and renders the tabbed UI, keeping the server fetching in page.tsx.