import { AppSyncResolverHandler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Ensure these types match your Schema in amplify/data/resource.ts
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
  startDate: string;
  endDate: string;
};

type PremiumQuote = {
  premium: number;
};

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export const handler: AppSyncResolverHandler<PredictPremiumArgs, PremiumQuote> = async (event) => {
  const { 
    age, gender, carAge, driverExp, prevAccidents, 
    vehicleDamage, regionCode, annualMileage, coverageAmount,
    startDate, endDate
  } = event.arguments;

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  console.log("Input Args:", JSON.stringify(event.arguments));

  const prompt = `
    You are an insurance rating engine. Calculate the premium.

    INPUT DATA:
    - Value: $${coverageAmount}
    - Driver: ${age}y/o (${gender})
    - Region: ${regionCode}
    - Accidents: ${prevAccidents}
    - Mileage: ${annualMileage}
    - Duration: ${durationDays} days

    ALGORITHM:
    1. Base = ${coverageAmount} * 0.02
    2. If Age < 25: * 1.4
    3. If Region 26: * 1.15
    4. If Accidents > 0: + (Accidents * 300)
    5. If Mileage > 15000: + 150
    6. Pro-rate for ${durationDays} days

    OUTPUT FORMAT:
    Return strictly valid JSON. Do not explain. Do not repeat the input.
    Example: {"premium": 1250}
  `;

  const modelId = "amazon.titan-text-express-v1";

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
            maxTokenCount: 512,
            temperature: 0,
            topP: 1
        }
      }),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    const rawAiText = responseBody.results[0].outputText;
    console.log("AI Raw Output:", rawAiText);

    // --- ROBUST PARSING STRATEGY ---

    // 1. Regex Search
    const jsonMatch = rawAiText.match(/\{.*"premium":\s*(\d+(\.\d+)?).*\}/s);
    
    let estimatedPremium = 0;
    
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            estimatedPremium = parsed.premium;
        } catch(e) {
            estimatedPremium = parseFloat(jsonMatch[1]);
        }
    } 
    
    // 2. Fallback: Search for numbers
    if (!estimatedPremium) {
         const numbers = rawAiText.match(/\d+/g)?.map(Number) || [];
         
         // --- FIX IS HERE: Added (n: number) ---
         const prices = numbers.filter((n: number) => n > 100); 
         
         if (prices.length > 0) {
             estimatedPremium = prices[prices.length - 1]; 
         }
    }

    // 3. Final Safety Check
    if (!estimatedPremium || estimatedPremium < 10) {
        console.error("Calculated premium seems wrong ($" + estimatedPremium + "). Defaulting.");
        return { premium: 950 }; 
    }

    return { premium: parseFloat(estimatedPremium.toFixed(2)) };

  } catch (error) {
    console.error("Bedrock Execution Error:", error);
    throw new Error("Failed to generate premium quote.");
  }
};