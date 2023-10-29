async function getVocabs(params: { url: string }) {
  const { url } = params

  const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/vocabs`,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
      })
    }
  )

  const result = await response.json()

  if (!response.ok) {
    console.error("Error fetching Vocab");
    throw new Error("Error fetching Vocab");
  }

  return { result }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url } = req.body;
  console.log("Vocab message received", url);
  try {
    const { result } = await getVocabs({ url })
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler