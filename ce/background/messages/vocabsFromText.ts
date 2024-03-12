async function getVocabsFromText(params: { url: string }) {
  const { text } = params

  const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/vocabFromText`,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
      })
    }
  )

  const result = await response.json()

  if (!response.ok) {
    console.error({ result })
    console.error("Error fetching Vocab");
    throw new Error("Error fetching Vocab");
  }

  return { result }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { text } = req.body;
  console.log("Vocabs From Text message received", text);
  try {
    const { result } = await getVocabsFromText({ text })
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler