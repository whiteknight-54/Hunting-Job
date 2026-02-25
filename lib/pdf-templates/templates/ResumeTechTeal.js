import { createResumeTemplate } from '../TemplateBase';

// Teal accent — tech/developer; one column, boxed section headers for scanability
export const ResumeTechTeal = createResumeTemplate({
    colors: {
        primary: '#0d9488',
        primaryDark: '#0f766e',
        textDark: '#134e4a',
        textMedium: '#0f766e',
        textLight: '#64748b',
        sectionBg: '#f0fdfa',
        sectionTitleColor: '#0d9488',
        summaryBg: '#f0fdfa',
        summaryBorderLeft: true,
        summaryPadding: '12px 15px',
        summaryBorderRadius: 3,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 10.5,
        nameSize: 24,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Technical Skills',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'split',
    sectionTitleStyle: 'box',
});

export default ResumeTechTeal;

