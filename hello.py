import os
from openai import OpenAI
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Initialize client with your API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Call a model
resp = client.responses.create(
    model="gpt-4.1",
    input="Say hello in one sentence. and tell me about a turkey"
)

print(resp.output_text)