import { createResumeTemplate } from '../TemplateBase';

// Steel blue-gray — consultant; underline section titles, center header; one column
export const ResumeConsultantSteel = createResumeTemplate({
    colors: {
        primary: '#64748b',
        primaryDark: '#475569',
        textDark: '#0f172a',
        textMedium: '#475569',
        textLight: '#64748b',
        sectionTitleColor: '#475569',
        nameColor: '#334155',
        summaryBg: '#f8fafc',
        summaryPadding: '10px 14px',
        summaryBorderLeft: true,
        summaryBorderRadius: 3,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 10.5,
        nameSize: 23,
        contactSize: 9,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Executive Summary',
        skills: 'Core Competencies',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'center',
    sectionTitleStyle: 'line',
});

export default ResumeConsultantSteel;

