from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="lm-studio",
)

response = client.responses.create(
    model="openai-gpt-oss-20b-abliterated-uncensored-neo-imatrix",
    input="What is the top trending model on hugging face?",
    extra_body={
        "integrations": [
            {
                "type": "ephemeral_mcp",
                "server_label": "huggingface",
                "server_url": "https://huggingface.co/mcp",
                "allowed_tools": ["model_search"],
            }
        ]
    },
)

print(response.output_text)