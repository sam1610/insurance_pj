import { AppSyncResolverHandler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"; 

// Types matching your Schema
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
  acceptanceProbability: number;
};

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION }); 

export const handler: AppSyncResolverHandler<PredictPremiumArgs, PremiumQuote> = async (event) => {
  const { 
    age, gender, carAge, driverExp, prevAccidents, 
    vehicleDamage, regionCode, annualMileage, coverageAmount,
    vintage, 
    startDate, endDate
  } = event.arguments;

  // --- STEP 1: PRE-CALCULATE MATH ---
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
  const durationMultiplier = durationDays / 365;
  const baseAnnualPremium = coverageAmount * 0.02;

  // --- STEP 2: ASK AI FOR RISK ADJUSTMENTS ---
  const prompt = `
    You are an expert insurance underwriter. Adjust the Annual Premium based on risk.
    BASE DATA:
    - Base Annual Premium: $${baseAnnualPremium}
    - Driver: ${age} years old (${gender})
    - Region Code: ${regionCode}
    - Accidents: ${prevAccidents}
    - Mileage: ${annualMileage} / year
    - Vehicle Damage History: ${vehicleDamage}
    RISK RULES:
    1. Region 26 +15%, Region 10 -10%.
    2. Age < 25 +30%. Male & < 25 +10%.
    3. Accident +$300 each. Prior Damage +$150.
    4. Mileage > 15k +$200.
    OUTPUT: JSON only {"annual_premium": 1500}
  `;

  try {
    const command = new InvokeModelCommand({
      modelId: "amazon.titan-text-express-v1",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: { maxTokenCount: 512, temperature: 0, topP: 1 }
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rawAiText = responseBody.results[0].outputText;

    // --- STEP 3: PARSE AI RESULT ---
    const jsonMatch = rawAiText.match(/\{.*"annual_premium":\s*(\d+(\.\d+)?).*\}/s);
    let annualPremium = 0;
    
    if (jsonMatch) {
        try { annualPremium = JSON.parse(jsonMatch[0]).annual_premium; } 
        catch(e) { annualPremium = parseFloat(jsonMatch[1]); }
    }
    if (!annualPremium) annualPremium = baseAnnualPremium + 500; 

    const finalPremium = annualPremium * durationMultiplier;

    // --- STEP 5: CALL ML MODEL FOR PROBABILITY ---
    let prob = 0;
    try {
        // FIX: Use the Environment Variable we set in backend.ts
        const functionName = process.env.ML_FUNCTION_NAME; 

        if (!functionName) throw new Error("ML_FUNCTION_NAME env var missing");

        const command = new InvokeCommand({
            FunctionName: functionName, // <--- Using Dynamic Name
            Payload: JSON.stringify({
                features: {
                    ...event.arguments,
                    annualPremium: finalPremium,
                    vintage: vintage 
                }
            })
        });
        
        const response = await lambdaClient.send(command);
        
        if (response.Payload) {
            const payload = JSON.parse(new TextDecoder().decode(response.Payload));
            if (payload.body) {
                const body = JSON.parse(payload.body);
                prob = body.probability;
            }
        }
    } catch (e) {
        console.warn("ML Model offline, defaulting to 0", e);
    }

    return { 
      premium: parseFloat(finalPremium.toFixed(2)), 
      acceptanceProbability: prob 
    };

  } catch (error) {
    console.error("Bedrock Execution Error:", error);
    throw new Error("Failed to generate premium quote.");
  }
};