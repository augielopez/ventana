import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MemberContextService } from './member-context.service';
import { evaluateProgramEligibility, ENROLLMENT_RULES } from '@/config/business-rules';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

/**
 * AI Assistant Service
 * Handles chat interactions and generates responses based on member context and business rules
 */
@Injectable({
    providedIn: 'root'
})
export class AiAssistantService {
    private chatHistory: Map<string, ChatMessage[]> = new Map();

    constructor(private memberContextService: MemberContextService) {}

    /**
     * Send a message and get AI response
     */
    sendMessage(memberId: string, message: string): Observable<ChatMessage> {
        // Get member context
        const memberContext = this.memberContextService.getMemberContext(memberId);
        
        // Generate response based on message content
        const responseContent = this.generateResponse(message, memberContext);
        
        // Create response message
        const response: ChatMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date()
        };

        // Add to history
        const userMessage: ChatMessage = {
            id: this.generateId(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        
        this.addToHistory(memberId, userMessage);
        this.addToHistory(memberId, response);

        // Simulate network delay
        return of(response).pipe(delay(800));
    }

    /**
     * Get chat history for a member
     */
    getChatHistory(memberId: string): ChatMessage[] {
        return this.chatHistory.get(memberId) || [];
    }

    /**
     * Clear chat history for a member
     */
    clearHistory(memberId: string): void {
        this.chatHistory.delete(memberId);
    }

    /**
     * Generate AI response based on question and member context
     */
    private generateResponse(question: string, memberContext: any): string {
        const lowerQuestion = question.toLowerCase();

        // Check for program enrollment questions
        if (lowerQuestion.includes('enroll') || lowerQuestion.includes('eligib')) {
            return this.handleEnrollmentQuestion(question, memberContext);
        }

        // Check for specific program questions
        const programKeywords = ['diabetes', 'cardiac', 'heart', 'copd', 'hypertension', 'maternity'];
        const matchedProgram = programKeywords.find(keyword => lowerQuestion.includes(keyword));
        
        if (matchedProgram) {
            return this.handleProgramSpecificQuestion(matchedProgram, memberContext);
        }

        // Check for member information questions
        if (lowerQuestion.includes('diagnosis') || lowerQuestion.includes('condition')) {
            return this.handleDiagnosisQuestion(memberContext);
        }

        if (lowerQuestion.includes('medication') || lowerQuestion.includes('drug')) {
            return this.handleMedicationQuestion(memberContext);
        }

        if (lowerQuestion.includes('lab') || lowerQuestion.includes('test')) {
            return this.handleLabQuestion(memberContext);
        }

        // Default response with member summary
        return this.generateDefaultResponse(memberContext);
    }

    /**
     * Handle enrollment-related questions
     */
    private handleEnrollmentQuestion(question: string, memberContext: any): string {
        const eligibility = memberContext.eligibilityAnalysis;
        
        let response = `Based on ${memberContext.name}'s current information:\n\n`;
        
        // Find programs mentioned in question
        let specificProgram = null;
        for (const result of eligibility) {
            if (question.toLowerCase().includes(result.programName.toLowerCase())) {
                specificProgram = result;
                break;
            }
        }

        if (specificProgram) {
            // Specific program question
            response += `**${specificProgram.programName}**\n\n`;
            
            if (specificProgram.eligible) {
                response += `✅ ${memberContext.name} IS ELIGIBLE for this program.\n\n`;
                response += `All required criteria are met:\n`;
                specificProgram.passedRules.filter((r: any) => r.required).forEach((rule: any) => {
                    response += `- ✓ ${rule.description}\n`;
                });
            } else {
                response += `❌ ${memberContext.name} is NOT ELIGIBLE for this program.\n\n`;
                response += `**Reasons for ineligibility:**\n\n`;
                
                specificProgram.failedRules.filter((r: any) => r.required).forEach((rule: any) => {
                    response += `- ✗ **${rule.description}**\n`;
                    response += `  ${rule.message}\n\n`;
                });

                if (specificProgram.conflictingPrograms?.length > 0) {
                    response += `\n⚠️ **Program Conflict:**\n`;
                    response += `Member is enrolled in: ${memberContext.currentPrograms.join(', ')}\n`;
                    response += `This conflicts with ${specificProgram.programName}\n`;
                }

                // Provide recommendations
                response += `\n**Recommendations:**\n`;
                specificProgram.failedRules.filter((r: any) => r.required).forEach((rule: any, index: number) => {
                    response += `${index + 1}. ${this.getRecommendation(rule)}\n`;
                });
            }
        } else {
            // General eligibility overview
            const eligible = eligibility.filter((r: any) => r.eligible);
            const ineligible = eligibility.filter((r: any) => !r.eligible);

            if (eligible.length > 0) {
                response += `**Eligible Programs (${eligible.length}):**\n`;
                eligible.forEach((prog: any) => {
                    response += `- ✅ ${prog.programName} (${prog.score}% match)\n`;
                });
                response += `\n`;
            }

            if (ineligible.length > 0) {
                response += `**Ineligible Programs (${ineligible.length}):**\n`;
                ineligible.forEach((prog: any) => {
                    const mainReason = prog.failedRules.filter((r: any) => r.required)[0];
                    response += `- ❌ ${prog.programName}\n`;
                    if (mainReason) {
                        response += `  Reason: ${mainReason.message}\n`;
                    }
                });
            }
        }

        return response;
    }

    /**
     * Handle program-specific questions
     */
    private handleProgramSpecificQuestion(programKeyword: string, memberContext: any): string {
        const programMap: any = {
            'diabetes': 'diabetes-care',
            'cardiac': 'cardiac-care',
            'heart': 'cardiac-care',
            'copd': 'copd-care',
            'hypertension': 'hypertension-mgmt',
            'maternity': 'maternity-care'
        };

        const programId = programMap[programKeyword];
        if (!programId) {
            return `I don't have information about that program. Available programs: Diabetes Care, Cardiac Care, COPD Care, Hypertension Management, and Maternity Care.`;
        }

        const evaluation = evaluateProgramEligibility(programId, memberContext);
        
        let response = `**${evaluation.programName}**\n\n`;
        response += `Eligibility Status: ${evaluation.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}\n`;
        response += `Match Score: ${evaluation.score}%\n\n`;

        if (evaluation.failedRules.length > 0) {
            response += `**Missing Requirements:**\n`;
            evaluation.failedRules.forEach((rule: any) => {
                response += `- ${rule.message}\n`;
            });
        }

        if (evaluation.passedRules.length > 0) {
            response += `\n**Met Requirements:**\n`;
            evaluation.passedRules.forEach((rule: any) => {
                response += `- ✓ ${rule.description}\n`;
            });
        }

        return response;
    }

    /**
     * Handle diagnosis questions
     */
    private handleDiagnosisQuestion(memberContext: any): string {
        let response = `**${memberContext.name}'s Diagnoses:**\n\n`;
        
        if (memberContext.diagnoses?.length > 0) {
            memberContext.diagnoses.forEach((dx: string) => {
                response += `- ${dx} ${this.getDiagnosisName(dx)}\n`;
            });
        } else {
            response += `No diagnoses on file.\n`;
        }

        return response;
    }

    /**
     * Handle medication questions
     */
    private handleMedicationQuestion(memberContext: any): string {
        let response = `**${memberContext.name}'s Current Medications:**\n\n`;
        
        if (memberContext.medications?.length > 0) {
            memberContext.medications.forEach((med: string) => {
                response += `- ${med}\n`;
            });
        } else {
            response += `No medications on file.\n`;
        }

        return response;
    }

    /**
     * Handle lab result questions
     */
    private handleLabQuestion(memberContext: any): string {
        let response = `**${memberContext.name}'s Recent Lab Results:**\n\n`;
        
        if (memberContext.labs && Object.keys(memberContext.labs).length > 1) {
            Object.entries(memberContext.labs).forEach(([key, value]) => {
                if (key !== 'lastUpdated') {
                    response += `- ${key}: ${value}\n`;
                }
            });
            response += `\nLast Updated: ${memberContext.labs.lastUpdated}\n`;
        } else {
            response += `No recent lab results available.\n`;
        }

        return response;
    }

    /**
     * Generate default response
     */
    private generateDefaultResponse(memberContext: any): string {
        return `I'm here to help answer questions about ${memberContext.name}'s eligibility, programs, and health information.\n\n` +
               `You can ask me things like:\n` +
               `- "Why wasn't this member enrolled in Diabetes Care?"\n` +
               `- "What programs is this member eligible for?"\n` +
               `- "What are their current diagnoses?"\n` +
               `- "Show me their medications"\n` +
               `- "What are their recent lab results?"\n\n` +
               `What would you like to know?`;
    }

    /**
     * Get recommendation based on failed rule
     */
    private getRecommendation(rule: any): string {
        if (rule.category === 'clinical') {
            if (rule.id.includes('HbA1c') || rule.id.includes('lab')) {
                return 'Schedule lab work to obtain missing test results';
            }
            if (rule.id.includes('diagnosis')) {
                return 'Verify diagnosis coding with provider documentation';
            }
            return 'Update clinical documentation';
        }
        
        if (rule.category === 'administrative') {
            if (rule.description.includes('active')) {
                return 'Resolve plan status issue - contact enrollment team';
            }
        }

        return 'Address this requirement to qualify for enrollment';
    }

    /**
     * Get diagnosis name from ICD-10 code
     */
    private getDiagnosisName(code: string): string {
        const dxMap: any = {
            'E11': '(Type 2 Diabetes Mellitus)',
            'I10': '(Essential Hypertension)',
            'I25': '(Coronary Artery Disease)',
            'E78': '(Hyperlipidemia)',
            'J44': '(COPD)',
            'F17': '(Nicotine Dependence)',
            'Z34': '(Pregnancy)'
        };

        for (const [prefix, name] of Object.entries(dxMap)) {
            if (code.startsWith(prefix)) {
                return name;
            }
        }

        return '';
    }

    /**
     * Add message to history
     */
    private addToHistory(memberId: string, message: ChatMessage): void {
        const history = this.chatHistory.get(memberId) || [];
        history.push(message);
        this.chatHistory.set(memberId, history);
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * PLACEHOLDER: Real AI API Integration
     * Uncomment and configure when ready to use OpenAI/Claude
     */
    /*
    private async callRealAI(question: string, memberContext: any): Promise<string> {
        // Example OpenAI integration:
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${environment.openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a healthcare program enrollment expert...'
                    },
                    {
                        role: 'user',
                        content: `Member Context:\n${this.memberContextService.formatContextForAI(memberContext)}\n\nQuestion: ${question}`
                    }
                ]
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    */
}

