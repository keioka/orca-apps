# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
from keybert import KeyBERT
import requests
from bs4 import BeautifulSoup

initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")

@https_fn.on_request()
def vocabs(req: https_fn.Request) -> https_fn.Response:
  
    # Usage example:
    url = "https://www.cnn.com/2023/09/24/politics/cassidy-hutchinson-interview-testimony-book/index.html"
    html_body_text = get_html_body_text(url)
    print(html_body_text)
    
    kw_model = KeyBERT()
    keywordsOne = kw_model.extract_keywords(html_body_text, top_n=20, keyphrase_ngram_range=(1, 1))
    keywordsTwo = kw_model.extract_keywords(html_body_text, top_n=20, keyphrase_ngram_range=(2, 2))
    keywordsThree = kw_model.extract_keywords(html_body_text, top_n=20, keyphrase_ngram_range=(3, 3))

    keywords = keywordsOne + keywordsTwo + keywordsThree
    print(keywords)

    vocabs = []
    for keyword in keywords:
      print(keyword)
      vocabs.append(keyword[0])
    
    print(vocabs)
    
    return https_fn.Response(vocabs, content_type="application/json")
  
def get_html_body_text(url):
    """
    Fetches the HTML body text from the specified URL.

    :param url: URL of the webpage to fetch HTML body text from
    :type url: str
    :return: Text content of the HTML body
    :rtype: str
    """
    # Send a GET request to the URL
    response = requests.get(url)
    # If the GET request is successful, the status code will be 200
    if response.status_code == 200:
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        # Extract the text from the body tag
        main_tag = soup.find('main')
        # If the <main> tag is found, extract its text content
        if main_tag:
            main_text = main_tag.text
            # Remove leading and trailing white space and intermediate white spaces
            cleaned_text = ' '.join(main_text.split())
            return cleaned_text
        else:
            body_text = soup.body.text.strip()
            cleaned_text = ' '.join(body_text.split())
            return cleaned_text
    else:
        return f"Error: Unable to fetch URL, status code: {response.status_code}"
