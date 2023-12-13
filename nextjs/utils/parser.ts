export async function parseWebText(url: string): Promise<string | null> {
  if (!url) {
    return null
  }

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const body = $('body').html();
  const document = new JSDOM(body)
  const article = new Readability(document.window.document).parse();

  // Use Cheerio to parse the HTML
  // const $ = cheerio.load(html);
  // const $ = await cheerio.fromURL(url);
  // const text = $('body').text();
  return article.textContent.trim();
}