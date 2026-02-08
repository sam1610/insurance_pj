import { AppSyncResolverHandler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// --- TYPES ---
type PredictPremiumArgs = {
  age: number;
  gender: string; 
  carAge: number;
  driverExp: number;
  prevAccidents: number;
  vehicleDamage: string;
  regionCode: string;
  annualMileage: number;
  coverageAmount: number;
  vintage: number; 
  startDate: string;
  endDate: string;
};

type PremiumQuote = {
  premium: number;
  acceptanceProbability: number | null; 
};

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export const handler: AppSyncResolverHandler<PredictPremiumArgs, PremiumQuote> = async (event) => {
  console.log("🚀 STARTING SIMULATION 🚀");
  console.log("INPUTS:", JSON.stringify(event.arguments));

  const { 
    age, gender, regionCode, prevAccidents, vehicleDamage, 
    coverageAmount, startDate, endDate 
  } = event.arguments;

  // --- PART 1: MATH ---
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const durationMultiplier = durationDays / 365;
  const baseAnnualPremium = coverageAmount * 0.02;

  // --- PART 2: PROMPT ---
  const prompt = `
    You are a strict Algorithmic Insurance Underwriter. 
    Calculate the 'annual_premium' by applying the following HEAVILY BIASED RISK RULES.

    INPUT PROFILE:
    - Base Premium: $${baseAnnualPremium}
    - Driver: ${age} years old, ${gender}
    - Region Code: ${regionCode} (26=Urban, 50=Suburban, 10=Rural)

    RULES:
    1. Male < 25: +50%. Female: -15%. 
    2. Urban (26): +30%. Rural (10): -20%.
    3. Accidents: +$400 each.

    OUTPUT FORMAT: {"annual_premium": 1234.56}
  `;

  let annualPremium = 0;

  try {
    // 1. Log before calling
    console.log("... Invoking Bedrock Titan Express ...");
    
    const command = new InvokeModelCommand({
      modelId: "amazon.titan-text-express-v1",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({ 
          inputText: prompt, 
          textGenerationConfig: { maxTokenCount: 128, temperature: 0 } 
      }),
    });

    const response = await bedrockClient.send(command);
    
    // 2. Log Raw Response
    const responseBody = new TextDecoder().decode(response.body);
    console.log("RAW AI RESPONSE:", responseBody);

    const parsedBody = JSON.parse(responseBody);
    const rawAiText = parsedBody.results[0].outputText;
    console.log("AI TEXT OUTPUT:", rawAiText);

    // 3. Parse JSON
    const jsonMatch = rawAiText.match(/\{.*"annual_premium":\s*(\d+(\.\d+)?).*\}/s);
    if (jsonMatch) {
        annualPremium = JSON.parse(jsonMatch[0]).annual_premium;
        console.log("✅ PARSED PREMIUM:", annualPremium);
    } else {
        console.error("❌ REGEX FAILED. Could not find JSON in text.");
        throw new Error("AI output format invalid");
    }

  } catch (e) {
    console.error("🔥 CRITICAL BEDROCK ERROR 🔥");
    console.error(e);
    
    // --- THE FIX IS HERE ---
    // We cast 'e' to 'Error' to satisfy TypeScript strictness
    const errorMessage = (e as Error).message;
    throw new Error(`Bedrock Failed: ${errorMessage}`);
  }

  const finalPremium = annualPremium * durationMultiplier;

  return { 
    premium: parseFloat(finalPremium.toFixed(2)), 
    acceptanceProbability: null 
  };
};