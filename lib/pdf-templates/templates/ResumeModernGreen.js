import { createResumeTemplate } from '../TemplateBase';

// Bright green — clean, underline-only section titles; one column
export const ResumeModernGreen = createResumeTemplate({
    colors: {
        primary: '#16a34a',
        primaryDark: '#15803d',
        textDark: '#14532d',
        textMedium: '#166534',
        textLight: '#6b7280',
        sectionTitleColor: '#15803d',
        nameColor: '#15803d',
        nameUppercase: false,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 10.5,
        nameSize: 22,
        contactSize: 9,
        titleSize: 11,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Key Skills',
        experience: 'Experience',
        education: 'Education',
    },
    headerLayout: 'split',
    sectionTitleStyle: 'line',
});

export default ResumeModernGreen;

