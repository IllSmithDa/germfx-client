import {API_PROXY_PATHS} from "@/config/paths";
import { ClientResult, SetPasswordFormValues } from "@/types/accountSettings";
import { normalizeClientResult } from "../helpers/accountSettings";


export async function setPasswordClient(
  payload: SetPasswordFormValues,
): Promise<ClientResult> {
  try {
    const response = await fetch(
      API_PROXY_PATHS.setPassword(),
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {}

    return normalizeClientResult(
      response,
      data,
      response.ok
        ? "GermFx password set successfully. Please log in again."
        : "Unable to set password.",
    );
  } catch {
    return {
      ok: false,
      message:
        "Network error. Please try again.",
    };
  }
}
