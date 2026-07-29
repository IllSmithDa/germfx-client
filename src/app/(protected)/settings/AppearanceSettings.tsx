import type { ThemeValue } from "@/lib/client/userSettingsApi";
import { SectionCard, SettingRow, selectClass } from "./SettingsUI";

export default function AppearanceSettings({
  theme,
  savingKey,
  onThemeChange,
}: {
  theme: ThemeValue;
  savingKey: string | null;
  onThemeChange: (value: ThemeValue) => void;
}) {
  return (
    <SectionCard title="Appearance" description="Control how the app looks.">
      <SettingRow
        label="Theme"
        description="Choose the appearance mode for the application."
        control={
          <select
            value={theme}
            disabled={savingKey === "theme"}
            onChange={(e) => onThemeChange(e.target.value as ThemeValue)}
            className={selectClass}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        }
      />
    </SectionCard>
  );
}