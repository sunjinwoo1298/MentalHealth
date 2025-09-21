import requests
import json

# Test the chat endpoint
response = requests.post("http://localhost:5010/chat", json={
    "message": "Hello, can you help me with anxiety?",
    "userId": "test_user"
})

print("Status Code:", response.status_code)
print("Response:")
print(json.dumps(response.json(), indent=2))