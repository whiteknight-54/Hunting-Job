import { createResumeTemplate } from '../TemplateBase';

// Academic purple — bar section headers; one column
export const ResumeAcademicPurple = createResumeTemplate({
    colors: {
        primary: '#6b46c1',
        primaryDark: '#5b21b6',
        textDark: '#1e1b4b',
        textMedium: '#4c1d95',
        textLight: '#6b7280',
        headerBg: '#faf5ff',
        sectionBg: '#f5f3ff',
        sectionTitleColor: '#5b21b6',
        nameColor: '#5b21b6',
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
        skills: 'Areas of Expertise',
        experience: 'Professional Experience',
        education: 'Education & Credentials',
    },
    headerLayout: 'center',
    sectionTitleStyle: 'bar',
});

export default ResumeAcademicPurple;

