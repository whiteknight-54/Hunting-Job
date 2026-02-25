import { createResumeTemplate } from '../TemplateBase';

// Slate gray — corporate; full-width bar section headers; one column
export const ResumeCorporateSlate = createResumeTemplate({
    colors: {
        primary: '#475569',
        primaryDark: '#334155',
        textDark: '#0f172a',
        textMedium: '#334155',
        textLight: '#64748b',
        sectionBg: '#f1f5f9',
        sectionTitleColor: '#334155',
        nameColor: '#334155',
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 11,
        nameSize: 24,
        contactSize: 9,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Professional Summary',
        skills: 'Core Competencies',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'split',
    sectionTitleStyle: 'bar',
});

export default ResumeCorporateSlate;

