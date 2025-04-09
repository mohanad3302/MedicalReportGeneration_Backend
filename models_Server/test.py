from openai import OpenAI

# Initialize the OpenAI client with OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)

predicted_classes = ["Effusion"]

messages = [
    {
        "role": "system",
        "content": (
            "You are an expert radiologist. Based on the input disease/condition, generate "
            "a radiology report with two clearly labeled sections. Follow these rules:\n"
            "1. IMPRESSION: Describe the finding in general terms without specifying location "
            "or laterality (since this information isn't provided). Keep it concise.\n"
            "2. RECOMMENDATION: Provide appropriate clinical follow-up suggestions.\n"
            "3. Use exact formatting: 'IMPRESSION:' and 'RECOMMENDATION:' in all caps with colons.\n"
            "4. Never assume or invent details not provided in the input.\n"
            "5. If multiple findings are provided, address each separately but concisely."
        )
    },
    {
        "role": "user",
        "content": f"Finding: {', '.join(predicted_classes)}. Generate a report without specifying location."
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

# Get the generated response
response = completion.choices[0].message.content

# Example of how to separate the sections (if the format is consistent)
if "IMPRESSION:" in response and "RECOMMENDATION:" in response:
    # Split the response into parts
    parts = response.split("IMPRESSION:")
    impression_part = parts[1].split("RECOMMENDATION:")[0].strip()
    recommendation_part = parts[1].split("RECOMMENDATION:")[1].strip()
    
    print("\nSeparated Sections:")
    print("IMPRESSION:", impression_part)
    print("RECOMMENDATION:", recommendation_part)