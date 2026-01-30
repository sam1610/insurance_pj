import { AppSyncResolverHandler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"; 

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


 const prompt = `
    You are a strict Algorithmic Insurance Underwriter. 
    Calculate the 'annual_premium' by applying the following BIASED RISK RULES to the Base Premium.

    INPUT PROFILE:
    - Base Premium: $${baseAnnualPremium}
    - Driver: ${age} years old, ${gender}
    - Region: ${regionCode}
    - Accidents: ${prevAccidents}
    - Damage History: ${vehicleDamage}

    MANDATORY BIAS RULES (Apply sequentially):
    
    1. GENDER & AGE BIAS (Statistical Profiling):
       - IF Gender is 'Male' AND Age < 25: INCREASE Base Premium by 40% (High Risk Group).
       - IF Gender is 'Male' AND Age >= 25: INCREASE Base Premium by 5%.
       - IF Gender is 'Female': DECREASE Base Premium by 10% (Safe Driver Bias).
       - IF Age > 60: INCREASE Base Premium by 15% (Senior Risk).

    2. REGION BIAS (Location Risk):
       - IF RegionCode is '28' (Urban): INCREASE result by 20%.
       - IF RegionCode is '50' (City): INCREASE result by 15%.
       - IF RegionCode is '8' or '10' (Rural): DECREASE result by 10%.
       
    3. HISTORY PENALTIES:
       - Add +$350 for EACH previous accident.
       - Add +$200 if Vehicle Damage is 'Yes'.

    OUTPUT INSTRUCTIONS:
    - Return ONLY raw JSON. No markdown, no explanation.
    - Format: {"annual_premium": 1234.56}
  `

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