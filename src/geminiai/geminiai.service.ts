import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiaiService {
  model: GenerativeModel;
  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
}
