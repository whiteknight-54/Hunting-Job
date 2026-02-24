import { createResumeTemplate } from '../TemplateBase';

// Soft sage green — easy on the eyes, calm and readable
export const ResumeVisionSage = createResumeTemplate({
    colors: {
        primary: '#4a7c59',
        primaryDark: '#3d6b4a',
        textDark: '#1e293b',
        textMedium: '#475569',
        textLight: '#64748b',
        sectionBg: '#f0f7f2',
        sectionTitleColor: '#3d6b4a',
        nameColor: '#2d5a3d',
        nameUppercase: false,
        summaryBg: '#f8faf8',
        summaryBorderLeft: true,
        summaryPadding: '12px 15px',
        summaryBorderRadius: 4,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 11,
        nameSize: 24,
        contactSize: 9,
        titleSize: 11,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Skills',
        experience: 'Experience',
        education: 'Education',
    },
    headerLayout: 'split',
});

export default ResumeVisionSage;
