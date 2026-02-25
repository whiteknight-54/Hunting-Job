import { createResumeTemplate } from '../TemplateBase';

// Navy + serif — executive; boxed section headers; one column
export const ResumeExecutiveNavy = createResumeTemplate({
    colors: {
        primary: '#1e3a8a',
        primaryDark: '#1e40af',
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
        body: 'Times-Roman',
        baseSize: 10.5,
        nameSize: 26,
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
    sectionTitleStyle: 'box',
});

export default ResumeExecutiveNavy;

