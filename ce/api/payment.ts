
export async function fetchPaymentHistory(email: string | null, token: string): { error?: string, result?: string } {
  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/stripe/payment`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        email
      })
    });

    const data = await result.json();

    if (!result.ok) {
      console.error({ result })
      console.error("Error fetching payment history");
    }

    return { result: data }
  } catch (error) {
    console.error("There was a problem with the request:", error);
    return { error: error.message };
  }
}