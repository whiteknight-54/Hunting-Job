import { createResumeTemplate } from '../TemplateBase';

// Charcoal + serif — classic; minimal section labels only; one column
export const ResumeClassicCharcoal = createResumeTemplate({
    colors: {
        primary: '#1f2937',
        primaryDark: '#111827',
        textDark: '#1f2937',
        textMedium: '#374151',
        textLight: '#6b7280',
        headerBg: '#f9fafb',
        sectionTitleColor: '#6b7280',
        nameColor: '#111827',
    },
    fonts: {
        body: 'Times-Roman',
        baseSize: 11,
        nameSize: 24,
        contactSize: 9,
        sectionSize: 9,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Expertise',
        experience: 'Experience',
        education: 'Education',
    },
    headerLayout: 'center',
    sectionTitleStyle: 'minimal',
});

export default ResumeClassicCharcoal;

