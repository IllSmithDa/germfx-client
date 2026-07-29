import { SERVER_PATHS } from "@/config/paths";

export async function handleSubscribe() {
  const submitURL = SERVER_PATHS.handlePayment();
  const response = await fetch(
    submitURL,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await response.json();

  window.location.href = data.checkout_url;
}