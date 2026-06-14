import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


export async function POST(request) {
  try {
    
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { contents, systemInstruction } = body;
    
    if (!contents || !Array.isArray(contents)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contents format' },
        { status: 400 }
      );
    }

    
    const apiKey = process.env.NEXT_PUBLIC_CHATBOT_KEY;
    if (!apiKey) {
      throw new Error('Chatbot API key not configured. Please add NEXT_PUBLIC_CHATBOT_KEY to your .env file');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    
    let model;
    try {
      model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      });
    } catch (modelError) {
      console.error('Failed to initialize Gemini model:', modelError);
      throw new Error('Failed to initialize AI model. Check your API key.');
    }

    
    const formattedContents = contents.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: msg.parts || [{ text: msg.text }]
    }));

    
    let result;
    try {
      result = await model.generateContent({
        contents: formattedContents,
      });
    } catch (geminiError) {
      console.error('Gemini API call failed:', geminiError);
      
      const errorMessage = geminiError.message || '';
      
      
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid api key')) {
        throw new Error('Invalid API key. Please check your NEXT_PUBLIC_CHATBOT_KEY in .env.local');
      }
      
      if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('quota exceeded')) {
        throw new Error(
          'API quota exceeded! Your current key has hit its rate limit.\n' +
          'Solutions:\n' +
          '1. Wait 1 minute (rate limit resets)\n' +
          '2. Wait 24 hours (daily limit resets)\n' +
          '3. Get a NEW FREE API key from: https://makersuite.google.com/app/apikey\n' +
          'Then update .env.local and restart server.'
        );
      }
      
      if (errorMessage.includes('PERMISSION_DENIED')) {
        throw new Error(
          'API access denied. This key may be disabled or restricted.\n' +
          'Get a new key from: https://makersuite.google.com/app/apikey'
        );
      }

      if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('high demand') || errorMessage.includes('Service Unavailable')) {
        throw new Error('Google servers are under high demand. Please try again in 30 seconds.');
      }
      
      
      throw new Error(`AI service error: ${geminiError.message}\nIf this persists, get a new API key from https://makersuite.google.com/app/apikey`);
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      candidates: [{
        content: {
          parts: [{ text }],
          role: 'model'
        }
      }]
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate response',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
