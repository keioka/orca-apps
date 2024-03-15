
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { data } = req.body;
  try {
    const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/jwtDecode`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error("Error fetching Vocab");
      throw new Error("Error fetching Vocab");
    }

    if (result.error) {
      throw new Error(result.error)
    }

    res.send(result.data);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler