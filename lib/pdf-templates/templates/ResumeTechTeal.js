import { createResumeTemplate } from '../TemplateBase';

export const ResumeTechTeal = createResumeTemplate({
    colors: {
        primary: '#0d9488',
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
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Technical Skills',
        experience: 'Experience',
        education: 'Education',
    },
    headerLayout: 'split',
});

export default ResumeTechTeal;

