import { fetchUserMedications } from "@/lib/server/fetchUserMedications";
import buildUniqueMedOptions from "@/lib/helpers/buildMedOptions";
import { fetchRecentSymptomNames } from "@/lib/server/fetchRecentSymptomNames";
import { fetchUserSettings } from "@/lib/server/fetchUserSettings";
import { fetchLastUsedMedicationId } from "@/lib/server/fetchLastMedicationId";
import SingleSymptomForm from "./SingleSymptomForm";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";
import { fetchUsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";

type MedOption = { id: number; name: string };



export default async function LogSymptomPage() {
   const [medications, recentSymptomNames, settings, lastUsedMedicationId] = await Promise.all([
    fetchUserMedications(10),
    fetchRecentSymptomNames(10),
    fetchUserSettings(),
    fetchLastUsedMedicationId(),
  ]);

  const rememberedMedicationId = settings.remember_last_medication
  ? lastUsedMedicationId
  : null;
  
  const medOptions: MedOption[] = buildUniqueMedOptions(medications);
  const user = await getCurrentUser();

  const symptomLogUsageStatus = user
    ? await fetchUsageLimitStatus("symptom_logs")
    : null;

  return (
    <>
      <SingleSymptomForm
        medOptions={medOptions}
        recentSymptomNames={
          settings.recent_suggestions_first ? recentSymptomNames : []
        }
        initialMedicationId={rememberedMedicationId}
        symptomLogUsageStatus={symptomLogUsageStatus}
      />
    </>
  )
}