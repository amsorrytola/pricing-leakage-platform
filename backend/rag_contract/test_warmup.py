import ollama
import time

print("🔥 Warming up model...")
start = time.time()

ollama.chat(
    model="llama3.2:3b",
    messages=[{"role": "user", "content": "warmup"}],
    options={"num_predict": 1, "temperature": 0},
)

print("✅ Warm-up done in", round(time.time() - start, 2), "seconds")
