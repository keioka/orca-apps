import axios from "axios"
export async function fetchVocab(paragraph: string) {
  try {
    console.log({ work: process.env.WORKSERVER_URL })
    const url = process.env.WORKSERVER_URL + "/vocab"
    const res = await axios.post(
      url,
      {
        paragraph
      }
    )
    console.log("Successfully run add-vocabs")
    return res.data.vocabs
  } catch (error) {
    console.error("Failed to run add-vocabs")
    console.error(error)
  }
}