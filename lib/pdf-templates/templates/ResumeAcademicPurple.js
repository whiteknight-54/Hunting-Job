import { createResumeTemplate } from '../TemplateBase';

export const ResumeAcademicPurple = createResumeTemplate({
    colors: {
        primary: '#6b46c1',
        textDark: '#1e1b4b',
        textMedium: '#4c1d95',
        textLight: '#6b7280',
        headerBg: '#faf5ff',
        sectionTitleColor: '#6b46c1',
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 11,
        nameSize: 24,
    },
    sectionTitles: {
        summary: 'Professional Summary',
        skills: 'Areas of Expertise',
        experience: 'Professional Experience',
        education: 'Education & Credentials',
    },
    headerLayout: 'center',
});

export default ResumeAcademicPurple;

