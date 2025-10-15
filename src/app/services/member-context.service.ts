import { Injectable } from '@angular/core';
import { evaluateAllPrograms, evaluateProgramEligibility } from '@/config/business-rules';

/**
 * Service to build comprehensive member context for AI assistant
 */
@Injectable({
    providedIn: 'root'
})
export class MemberContextService {
    
    /**
     * Get complete member context including all data and eligibility analysis
     */
    getMemberContext(memberId: string): any {
        // In a real app, this would fetch from multiple services/APIs
        // For now, we'll return mock data based on the member ID
        const memberData = this.getMockMemberData(memberId);
        const eligibilityResults = evaluateAllPrograms(memberData);
        
        return {
            ...memberData,
            eligibilityAnalysis: eligibilityResults
        };
    }

    /**
     * Get mock member data
     * In production, this would call actual services to fetch data
     */
    private getMockMemberData(memberId: string): any {
        // Sample member data with various scenarios
        const mockData: any = {
            'MEM-001234': {
                memberId: 'MEM-001234',
                name: 'John Smith',
                age: 67,
                gender: 'Male',
                dateOfBirth: '01/15/1965',
                planStatus: 'Active',
                lineOfBusiness: 'Medicare',
                language: 'English',
                phoneNumber: '(555) 123-4567',
                address: '123 Main St, San Diego, CA 92101',
                
                // Clinical data
                diagnoses: ['E11.9', 'I10', 'E78.5'],  // Diabetes, Hypertension, Hyperlipidemia
                labs: {
                    hba1c: '8.2',
                    ldl: '145',
                    lastUpdated: '2024-10-01'
                },
                vitals: {
                    bloodPressure: '145/92',
                    weight: '210 lbs',
                    bmi: '30.2',
                    lastUpdated: '2024-10-10'
                },
                medications: [
                    'Metformin 1000mg twice daily',
                    'Lisinopril 20mg daily',
                    'Atorvastatin 40mg daily'
                ],
                procedures: ['Annual wellness visit', 'Diabetic eye exam'],
                
                // Program data
                currentPrograms: [],
                previousPrograms: [],
                
                // Claims data
                recentClaims: [
                    { date: '2024-09-15', provider: 'Dr. Johnson', type: 'Office Visit', amount: 150 },
                    { date: '2024-08-20', provider: 'Quest Diagnostics', type: 'Lab Work', amount: 95 }
                ],
                
                // Hospitalizations
                recentHospitalizations: []
            },
            'MEM-002345': {
                memberId: 'MEM-002345',
                name: 'Maria Garcia',
                age: 45,
                gender: 'Female',
                dateOfBirth: '03/22/1978',
                planStatus: 'Active',
                lineOfBusiness: 'Medicaid',
                language: 'Spanish',
                phoneNumber: '(555) 234-5678',
                address: '456 Oak Ave, Los Angeles, CA 90001',
                
                diagnoses: ['I25.10', 'E11.9'],  // Coronary artery disease, Diabetes
                labs: {
                    hba1c: '7.5',
                    troponin: 'Normal',
                    lastUpdated: '2024-09-25'
                },
                vitals: {
                    bloodPressure: '138/88',
                    weight: '165 lbs',
                    bmi: '27.8',
                    lastUpdated: '2024-10-12'
                },
                medications: [
                    'Aspirin 81mg daily',
                    'Metoprolol 50mg twice daily',
                    'Insulin glargine'
                ],
                procedures: ['Angioplasty with stent placement', 'Cardiac catheterization'],
                
                currentPrograms: ['diabetes-care'],
                previousPrograms: [],
                
                recentClaims: [
                    { date: '2024-09-01', provider: 'Cardiology Associates', type: 'Cardiology Visit', amount: 250 },
                    { date: '2024-08-15', provider: 'Hospital', type: 'Cardiac Procedure', amount: 15000 }
                ],
                
                recentHospitalizations: [
                    { date: '2024-08-15', reason: 'Chest pain, cardiac catheterization', days: 3 }
                ]
            },
            'MEM-003456': {
                memberId: 'MEM-003456',
                name: 'Wei Chen',
                age: 52,
                gender: 'Male',
                dateOfBirth: '07/08/1982',
                planStatus: 'Pending',  // Not active - will fail enrollment
                lineOfBusiness: 'Marketplace',
                language: 'Chinese',
                phoneNumber: '(555) 345-6789',
                address: '789 Elm St, San Francisco, CA 94102',
                
                diagnoses: ['J44.1', 'F17.210'],  // COPD, Nicotine dependence
                labs: {
                    lastUpdated: '2024-10-05'
                },
                vitals: {
                    bloodPressure: '125/80',
                    weight: '175 lbs',
                    lastUpdated: '2024-10-08'
                },
                medications: [
                    'Albuterol inhaler as needed',
                    'Tiotropium 18mcg daily'
                ],
                procedures: [],
                
                currentPrograms: [],
                previousPrograms: [],
                
                recentClaims: [
                    { date: '2024-09-20', provider: 'Pulmonology Clinic', type: 'Office Visit', amount: 175 }
                ],
                
                recentHospitalizations: [
                    { date: '2024-07-10', reason: 'COPD exacerbation, respiratory distress', days: 4 }
                ]
            }
        };

        // Return mock data or default
        return mockData[memberId] || {
            memberId,
            name: 'Unknown Member',
            age: 0,
            gender: 'Unknown',
            planStatus: 'Unknown',
            diagnoses: [],
            currentPrograms: [],
            labs: {},
            vitals: {},
            medications: [],
            procedures: [],
            recentClaims: [],
            recentHospitalizations: []
        };
    }

    /**
     * Format member context as readable text for AI
     */
    formatContextForAI(memberContext: any): string {
        const ctx = memberContext;
        let formatted = `Member Information:\n`;
        formatted += `- ID: ${ctx.memberId}\n`;
        formatted += `- Name: ${ctx.name}\n`;
        formatted += `- Age: ${ctx.age}, Gender: ${ctx.gender}\n`;
        formatted += `- Plan Status: ${ctx.planStatus}\n`;
        formatted += `- Line of Business: ${ctx.lineOfBusiness}\n\n`;

        if (ctx.diagnoses?.length > 0) {
            formatted += `Diagnoses: ${ctx.diagnoses.join(', ')}\n\n`;
        }

        if (ctx.labs && Object.keys(ctx.labs).length > 1) {
            formatted += `Recent Labs:\n`;
            Object.entries(ctx.labs).forEach(([key, value]) => {
                if (key !== 'lastUpdated') {
                    formatted += `- ${key}: ${value}\n`;
                }
            });
            formatted += `\n`;
        }

        if (ctx.vitals && Object.keys(ctx.vitals).length > 1) {
            formatted += `Vitals:\n`;
            Object.entries(ctx.vitals).forEach(([key, value]) => {
                if (key !== 'lastUpdated') {
                    formatted += `- ${key}: ${value}\n`;
                }
            });
            formatted += `\n`;
        }

        if (ctx.currentPrograms?.length > 0) {
            formatted += `Currently Enrolled Programs: ${ctx.currentPrograms.join(', ')}\n\n`;
        }

        return formatted;
    }
}

