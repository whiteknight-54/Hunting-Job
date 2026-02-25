import { createResumeTemplate } from '../TemplateBase';

// Deep navy header — high contrast; bar section headers; one column
export const ResumeVisionMidnight = createResumeTemplate({
    colors: {
        primary: '#0f172a',
        primaryDark: '#020617',
        textDark: '#0f172a',
        textMedium: '#334155',
        textLight: '#64748b',
        headerBg: '#0f172a',
        sectionBg: '#f1f5f9',
        sectionTitleColor: '#0f172a',
        nameColor: '#ffffff',
        titleColor: '#cbd5e1',
        contactColor: '#94a3b8',
        nameUppercase: false,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 10.5,
        nameSize: 24,
        contactSize: 9,
        titleSize: 11,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Technical Skills',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'center',
    sectionTitleStyle: 'bar',
});

export default ResumeVisionMidnight;
