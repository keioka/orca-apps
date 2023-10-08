async function getSummariesByLevel(params: { url: string, levels: string[] }) {
  const { url, levels } = params

  const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/summaryByLevel`,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        levels
      })
    }
  )

  const result = await response.json()
  console.log({ result })

  if (!response.ok) {
    console.log({ result })
    console.error("Error fetching Vocab");
    throw new Error("Error fetching Vocab");
  }

  return { result }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url, levels } = req.body;
  console.log("Vocabs From Text message received", url);
  try {
    const { result } = await getSummariesByLevel({ url, levels })
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler