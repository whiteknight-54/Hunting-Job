import { createResumeTemplate } from '../TemplateBase';

// Warm coral accent — distinctive and confident
export const ResumeVisionCoral = createResumeTemplate({
    colors: {
        primary: '#c2410c',
        primaryDark: '#9a3412',
        textDark: '#1c1917',
        textMedium: '#57534e',
        textLight: '#78716c',
        headerBg: '#fff7ed',
        sectionBg: '#fff7ed',
        sectionTitleColor: '#9a3412',
        nameColor: '#c2410c',
        nameUppercase: false,
        summaryBg: '#fffbeb',
        summaryBorderLeft: true,
        summaryPadding: '12px 15px',
        summaryBorderRadius: 4,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 10.5,
        nameSize: 25,
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

export default ResumeVisionCoral;
