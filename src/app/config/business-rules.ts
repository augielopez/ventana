/**
 * Business Rules Configuration
 * Defines enrollment eligibility rules, program criteria, and validation logic
 */

export interface ProgramRule {
    id: string;
    programName: string;
    category: 'clinical' | 'demographic' | 'administrative' | 'conflict';
    description: string;
    required: boolean;
    condition: (memberData: any) => boolean;
    failureMessage: (memberData: any) => string;
}

export interface EnrollmentRule {
    programId: string;
    programName: string;
    rules: ProgramRule[];
    conflictingPrograms?: string[];
}

/**
 * Program Enrollment Rules
 */
export const ENROLLMENT_RULES: EnrollmentRule[] = [
    {
        programId: 'diabetes-care',
        programName: 'Diabetes Care Management',
        rules: [
            {
                id: 'DM-001',
                programName: 'Diabetes Care Management',
                category: 'clinical',
                description: 'Member must have diabetes diagnosis (ICD-10: E11)',
                required: true,
                condition: (member) => {
                    return member.diagnoses?.some((d: string) => d.startsWith('E11')) || false;
                },
                failureMessage: (member) => 'No diabetes diagnosis found. Required: ICD-10 code E11.x'
            },
            {
                id: 'DM-002',
                programName: 'Diabetes Care Management',
                category: 'clinical',
                description: 'HbA1c level must be > 7%',
                required: true,
                condition: (member) => {
                    const hba1c = member.labs?.hba1c;
                    return hba1c && parseFloat(hba1c) > 7;
                },
                failureMessage: (member) => {
                    const hba1c = member.labs?.hba1c;
                    return hba1c 
                        ? `HbA1c level of ${hba1c}% is below required threshold of 7%`
                        : 'Missing HbA1c lab result from past 6 months';
                }
            },
            {
                id: 'DM-003',
                programName: 'Diabetes Care Management',
                category: 'demographic',
                description: 'Member must be 18 years or older',
                required: true,
                condition: (member) => member.age >= 18,
                failureMessage: (member) => `Member age ${member.age} is below minimum age of 18`
            },
            {
                id: 'DM-004',
                programName: 'Diabetes Care Management',
                category: 'administrative',
                description: 'Member must have active plan status',
                required: true,
                condition: (member) => member.planStatus === 'Active',
                failureMessage: (member) => `Plan status is "${member.planStatus}". Required: Active`
            }
        ],
        conflictingPrograms: ['cardiac-care']
    },
    {
        programId: 'cardiac-care',
        programName: 'Cardiac Care Management',
        rules: [
            {
                id: 'CC-001',
                programName: 'Cardiac Care Management',
                category: 'clinical',
                description: 'Member must have cardiac diagnosis (ICD-10: I25)',
                required: true,
                condition: (member) => {
                    return member.diagnoses?.some((d: string) => d.startsWith('I25')) || false;
                },
                failureMessage: (member) => 'No cardiac diagnosis found. Required: ICD-10 code I25.x'
            },
            {
                id: 'CC-002',
                programName: 'Cardiac Care Management',
                category: 'clinical',
                description: 'Recent cardiac event or procedure',
                required: true,
                condition: (member) => {
                    return member.procedures?.some((p: string) => 
                        p.includes('CABG') || p.includes('Angioplasty') || p.includes('Stent')
                    ) || false;
                },
                failureMessage: (member) => 'No recent cardiac event or procedure documented'
            },
            {
                id: 'CC-003',
                programName: 'Cardiac Care Management',
                category: 'administrative',
                description: 'Member must have active plan status',
                required: true,
                condition: (member) => member.planStatus === 'Active',
                failureMessage: (member) => `Plan status is "${member.planStatus}". Required: Active`
            }
        ],
        conflictingPrograms: ['diabetes-care']
    },
    {
        programId: 'hypertension-mgmt',
        programName: 'Hypertension Management',
        rules: [
            {
                id: 'HTN-001',
                programName: 'Hypertension Management',
                category: 'clinical',
                description: 'Member must have hypertension diagnosis (ICD-10: I10)',
                required: true,
                condition: (member) => {
                    return member.diagnoses?.some((d: string) => d.startsWith('I10')) || false;
                },
                failureMessage: (member) => 'No hypertension diagnosis found. Required: ICD-10 code I10.x'
            },
            {
                id: 'HTN-002',
                programName: 'Hypertension Management',
                category: 'clinical',
                description: 'Blood pressure must be elevated (BP > 140/90)',
                required: true,
                condition: (member) => {
                    const bp = member.vitals?.bloodPressure;
                    if (!bp) return false;
                    const [systolic] = bp.split('/').map(Number);
                    return systolic > 140;
                },
                failureMessage: (member) => {
                    const bp = member.vitals?.bloodPressure;
                    return bp 
                        ? `Blood pressure ${bp} does not meet criteria (>140/90)`
                        : 'Missing recent blood pressure reading';
                }
            },
            {
                id: 'HTN-003',
                programName: 'Hypertension Management',
                category: 'administrative',
                description: 'Member must have active plan status',
                required: true,
                condition: (member) => member.planStatus === 'Active',
                failureMessage: (member) => `Plan status is "${member.planStatus}". Required: Active`
            }
        ]
    },
    {
        programId: 'copd-care',
        programName: 'COPD Care Management',
        rules: [
            {
                id: 'COPD-001',
                programName: 'COPD Care Management',
                category: 'clinical',
                description: 'Member must have COPD diagnosis (ICD-10: J44)',
                required: true,
                condition: (member) => {
                    return member.diagnoses?.some((d: string) => d.startsWith('J44')) || false;
                },
                failureMessage: (member) => 'No COPD diagnosis found. Required: ICD-10 code J44.x'
            },
            {
                id: 'COPD-002',
                programName: 'COPD Care Management',
                category: 'clinical',
                description: 'Recent hospitalization or ER visit for respiratory issue',
                required: false,
                condition: (member) => {
                    return member.recentHospitalizations?.some((h: any) => 
                        h.reason?.toLowerCase().includes('respiratory') || 
                        h.reason?.toLowerCase().includes('copd')
                    ) || false;
                },
                failureMessage: (member) => 'No recent respiratory-related hospitalization (recommended but not required)'
            },
            {
                id: 'COPD-003',
                programName: 'COPD Care Management',
                category: 'demographic',
                description: 'Member must be 40 years or older',
                required: true,
                condition: (member) => member.age >= 40,
                failureMessage: (member) => `Member age ${member.age} is below minimum age of 40`
            }
        ]
    },
    {
        programId: 'maternity-care',
        programName: 'Maternity Care Program',
        rules: [
            {
                id: 'MAT-001',
                programName: 'Maternity Care Program',
                category: 'demographic',
                description: 'Member must be female',
                required: true,
                condition: (member) => member.gender === 'Female',
                failureMessage: (member) => `Member gender is ${member.gender}. Required: Female`
            },
            {
                id: 'MAT-002',
                programName: 'Maternity Care Program',
                category: 'clinical',
                description: 'Member must have pregnancy diagnosis (ICD-10: Z34)',
                required: true,
                condition: (member) => {
                    return member.diagnoses?.some((d: string) => d.startsWith('Z34')) || false;
                },
                failureMessage: (member) => 'No pregnancy diagnosis found. Required: ICD-10 code Z34.x'
            },
            {
                id: 'MAT-003',
                programName: 'Maternity Care Program',
                category: 'demographic',
                description: 'Member must be between 15-50 years old',
                required: true,
                condition: (member) => member.age >= 15 && member.age <= 50,
                failureMessage: (member) => `Member age ${member.age} is outside acceptable range (15-50)`
            }
        ]
    }
];

/**
 * Helper function to evaluate member eligibility for a program
 */
export function evaluateProgramEligibility(programId: string, memberData: any) {
    const enrollmentRule = ENROLLMENT_RULES.find(r => r.programId === programId);
    
    if (!enrollmentRule) {
        return {
            eligible: false,
            error: 'Program not found',
            passedRules: [],
            failedRules: []
        };
    }

    const passedRules: ProgramRule[] = [];
    const failedRules: Array<ProgramRule & { message: string }> = [];

    enrollmentRule.rules.forEach(rule => {
        const passed = rule.condition(memberData);
        
        if (passed) {
            passedRules.push(rule);
        } else {
            failedRules.push({
                ...rule,
                message: rule.failureMessage(memberData)
            });
        }
    });

    // Check for conflicting programs
    const hasConflict = enrollmentRule.conflictingPrograms?.some(
        conflictProgram => memberData.currentPrograms?.includes(conflictProgram)
    );

    const eligible = failedRules.filter(r => r.required).length === 0 && !hasConflict;

    return {
        eligible,
        programName: enrollmentRule.programName,
        passedRules,
        failedRules,
        conflictingPrograms: hasConflict ? enrollmentRule.conflictingPrograms : [],
        score: Math.round((passedRules.length / enrollmentRule.rules.length) * 100)
    };
}

/**
 * Evaluate all programs for a member
 */
export function evaluateAllPrograms(memberData: any) {
    return ENROLLMENT_RULES.map(rule => ({
        programId: rule.programId,
        ...evaluateProgramEligibility(rule.programId, memberData)
    }));
}

