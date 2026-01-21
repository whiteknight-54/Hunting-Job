import { createResumeTemplate } from '../TemplateBase';

export const ResumeCorporateSlate = createResumeTemplate({
    colors: {
        primary: '#475569',
        primaryDark: '#334155',
        textDark: '#0f172a',
        textMedium: '#334155',
        textLight: '#64748b',
        sectionBg: '#f8fafc',
        sectionTitleColor: '#334155',
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 11,
        nameSize: 24,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Skills',
        experience: 'Experience',
        education: 'Education',
    },
    headerLayout: 'split',
});

export default ResumeCorporateSlate;

