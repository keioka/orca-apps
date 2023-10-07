async function getGMCheck(params: { sentence: string }) {
  const { sentence } = params

  const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/gmCheck`,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sentence,
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
  const { sentence } = req.body;
  console.log("GMCheck message received", sentence);
  try {
    const { result } = await getGMCheck({ sentence })
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler