from openai import OpenAI

# Initialize the OpenAI client with OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)

# Define the predicted classes (diseases or conditions)
predicted_classes = ["Effusion"]

# Define the system and user messages for the prompt
messages = [
    {
        "role": "system",
        "content": (
            "You are an expert radiologist. Based on the input disease or condition, your task is to provide a brief and factual "
            "description of the disease or condition, focusing only on general characteristics. Your response should be concise, "
            "accurate, and free from unnecessary details."
        )
    },
    {
        "role": "user",
        "content": f"Disease: {', '.join(predicted_classes)}"
    }
]

# Make the API request to DeepSeek R1
completion = client.chat.completions.create(
    extra_headers={
        "HTTP-Referer": "<YOUR_SITE_URL>",  # Optional. Replace with your site URL for rankings on OpenRouter.
        "X-Title": "<YOUR_SITE_NAME>",  # Optional. Replace with your site name for rankings on OpenRouter.
    },
    extra_body={},  # Optional. Add any additional parameters if needed.
    model="deepseek/deepseek-r1-zero:free",  # Specify the DeepSeek R1 model
    messages=messages  # Pass the messages for the prompt
)

# Print the generated response
print(completion.choices[0].message.content)