import { createResumeTemplate } from '../TemplateBase';

export const ResumeExecutiveNavy = createResumeTemplate({
    colors: {
        primary: '#1e3a8a',
        textDark: '#0f172a',
        textMedium: '#1e3a8a',
        textLight: '#64748b',
        headerBg: '#eff6ff',
        sectionBg: '#eff6ff',
        sectionTitleColor: '#1e3a8a',
        nameColor: '#1e3a8a',
        nameUppercase: true,
    },
    fonts: {
        body: 'Times-Roman', // Serif for executive
        baseSize: 10.5,
        nameSize: 26,
    },
    sectionTitles: {
        summary: 'Executive Summary',
        skills: 'Core Competencies',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'center',
});

export default ResumeExecutiveNavy;

