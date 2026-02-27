export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other',
    PreferNotToSay = 'prefer_not_to_say',
}

export enum InvestmentExperience {
    Blockchain = 'Quiero explorar blockchain',
    Beginner = 'Principiante en inversiones',
    Intermediate = 'Experiencia intermedia',
    Expert = 'Inversor experimentado',
}

export enum EmploymentStatus {
    Employed = 'Empleado',
    Freelance = 'Independiente',
    Business = 'Empresario',
    Student = 'Estudiante',
    Unemployed = 'Desempleado',
    Retired = 'Jubilado',
}

export enum InvestmentExpertise {
    Expert = 'Experto en inversiones',
    Basic = 'Conocimientos básicos',
    Learning = 'Aprendiendo',
}

export enum InvestmentTimeline {
    ShortTerm = 'Corto plazo (menos de 1 año)',
    MidTerm = 'Mediano plazo (1-3 años)',
    LongTerm = 'Largo plazo (3-5 años)',
    VeryLongTerm = 'Inversionista a muy largo plazo',
}

export enum RiskTolerance {
    Conservative = 'Conservador',
    Moderate = 'Moderado',
    Comfortable = 'Cómodo con riesgo financiero',
    Aggressive = 'Agresivo',
}

export const AVAILABLE_CATEGORIES = [
    'Tokenización',
    'Natillera',
    'Automóviles',
    'Inmobiliario',
    'Criptomonedas',
    'Agricultura',
    'Tecnología',
    'Energía',
] as const;

export type AvailableCategory = typeof AVAILABLE_CATEGORIES[number];

export const GENDER_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: Gender.Male, label: 'Hombre' },
    { value: Gender.Female, label: 'Mujer' },
    { value: Gender.Other, label: 'Otro' },
    { value: Gender.PreferNotToSay, label: 'Prefiero no decir' },
];

export const INVESTMENT_EXPERIENCE_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: InvestmentExperience.Blockchain, label: 'Quiero explorar blockchain' },
    { value: InvestmentExperience.Beginner, label: 'Principiante en inversiones' },
    { value: InvestmentExperience.Intermediate, label: 'Experiencia intermedia' },
    { value: InvestmentExperience.Expert, label: 'Inversor experimentado' },
];

export const EMPLOYMENT_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: EmploymentStatus.Employed, label: 'Empleado' },
    { value: EmploymentStatus.Freelance, label: 'Independiente' },
    { value: EmploymentStatus.Business, label: 'Empresario' },
    { value: EmploymentStatus.Student, label: 'Estudiante' },
    { value: EmploymentStatus.Unemployed, label: 'Desempleado' },
    { value: EmploymentStatus.Retired, label: 'Jubilado' },
];

export const EXPERTISE_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: InvestmentExpertise.Expert, label: 'Experto en inversiones' },
    { value: InvestmentExpertise.Basic, label: 'Conocimientos básicos' },
    { value: InvestmentExpertise.Learning, label: 'Aprendiendo' },
];

export const TIMELINE_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: InvestmentTimeline.ShortTerm, label: 'Corto plazo (menos de 1 año)' },
    { value: InvestmentTimeline.MidTerm, label: 'Mediano plazo (1-3 años)' },
    { value: InvestmentTimeline.LongTerm, label: 'Largo plazo (3-5 años)' },
    { value: InvestmentTimeline.VeryLongTerm, label: 'Inversionista a muy largo plazo' },
];

export const RISK_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: RiskTolerance.Conservative, label: 'Conservador' },
    { value: RiskTolerance.Moderate, label: 'Moderado' },
    { value: RiskTolerance.Comfortable, label: 'Cómodo con riesgo financiero' },
    { value: RiskTolerance.Aggressive, label: 'Agresivo' },
];

export const INTEREST_OPTIONS = [
    { value: '', label: 'Seleccionar' },
    { value: 'Editar activos que me interesan', label: 'Editar activos que me interesan' },
    { value: 'Bienes raíces', label: 'Bienes raíces' },
    { value: 'Acciones', label: 'Acciones' },
    { value: 'Cripto', label: 'Cripto' },
];
