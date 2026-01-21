import { createResumeTemplate } from '../TemplateBase';

export const ResumeConsultantSteel = createResumeTemplate({
    colors: {
        primary: '#475569',
        primaryDark: '#334155',
        textDark: '#0f172a',
        textMedium: '#334155',
        textLight: '#64748b',
        sectionBg: '#f8fafc',
        sectionTitleColor: '#334155',
        summaryBg: '#f8fafc',
        summaryPadding: '8px 12px',
        summaryBorderRadius: 3,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 10,
        nameSize: 22,
        contactSize: 8.5,
    },
    sectionTitles: {
        summary: 'Executive Summary',
        skills: 'Core Competencies',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'center',
});

export default ResumeConsultantSteel;

