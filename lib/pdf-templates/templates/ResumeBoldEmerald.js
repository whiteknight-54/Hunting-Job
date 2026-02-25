import { createResumeTemplate } from '../TemplateBase';

// Emerald — bold bar section headers, summary box; one column
export const ResumeBoldEmerald = createResumeTemplate({
    colors: {
        primary: '#059669',
        primaryDark: '#047857',
        textDark: '#064e3b',
        textMedium: '#065f46',
        textLight: '#6b7280',
        headerBg: '#f0fdf4',
        sectionBg: '#ecfdf5',
        sectionTitleColor: '#047857',
        summaryBg: '#f0fdf4',
        summaryBorderLeft: true,
        summaryPadding: '12px 15px',
        summaryBorderRadius: 4,
    },
    fonts: {
        body: 'Helvetica',
        baseSize: 11,
        nameSize: 25,
        contactSize: 9,
        nameUppercase: true,
        sectionSize: 10,
    },
    sectionTitles: {
        summary: 'Summary',
        skills: 'Key Skills',
        experience: 'Professional Experience',
        education: 'Education',
    },
    headerLayout: 'center',
    sectionTitleStyle: 'bar',
});

export default ResumeBoldEmerald;

