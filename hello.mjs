import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const res = await client.responses.create({
  model: "gpt-4.1",
  input: "Say hello in one sentence."
});

console.log(res.output_text);
