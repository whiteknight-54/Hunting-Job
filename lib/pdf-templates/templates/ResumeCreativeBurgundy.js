import { createResumeTemplate } from '../TemplateBase';

// Black & bold — creative; strong bar headers; one column
export const ResumeCreativeBurgundy = createResumeTemplate({
    colors: {
        primary: '#7c2d12',
        primaryDark: '#431407',
        textDark: '#1c1917',
        textMedium: '#44403c',
        textLight: '#78716c',
        sectionBg: '#fef2f2',
        sectionTitleColor: '#431407',
        nameColor: '#1c1917',
        nameUppercase: true,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 11,
        nameSize: 26,
        titleSize: 12,
        contactSize: 9,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Professional Summary',
        skills: 'Core Competencies',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'center',
    sectionTitleStyle: 'bar',
});

export default ResumeCreativeBurgundy;

