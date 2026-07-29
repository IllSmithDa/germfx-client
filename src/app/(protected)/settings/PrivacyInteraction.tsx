import { SectionCard } from "./SettingsUI";

export default function PrivacyInteraction() {
  return (
    <SectionCard
      title="Privacy & Interaction"
      description="Current behavior for social features."
    >
      <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
        <li>Reaction counts are shown in aggregate only.</li>
        <li>Your saved articles and recalls are private to your account.</li>
        <li>Settings are saved to your account and can sync across devices.</li>
      </ul>
    </SectionCard>
  );
}