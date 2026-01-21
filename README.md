# Resume Generator - AI-Powered ATS-Optimized Resume Builder

An intelligent resume generation system that uses AI to create ATS-optimized resumes tailored to specific job descriptions. The system automatically detects the role type and uses specialized prompts to generate highly targeted resumes.

## 🚀 Features

### Core Features
- **AI-Powered Resume Generation**: Uses Claude (Anthropic) or OpenAI to generate ATS-optimized resume content
- **Role-Based Prompt Selection**: Automatically detects job role (Frontend, Backend, Full-Stack, DevOps, Salesforce, SAP, etc.) and uses specialized prompts
- **Multiple Resume Templates**: 10+ professional PDF resume templates with different styles
- **Profile Management**: Support for multiple candidate profiles with easy switching
- **Job Description Analysis**: Validates job descriptions (remote-only, mid-level+ positions)
- **Real-Time Generation**: Live timer showing generation progress
- **PDF Export**: High-quality PDF resumes ready for ATS systems

### Advanced Features
- **Intelligent Role Detection**: Analyzes job descriptions to identify role type (<10ms detection time)
- **Prompt Caching**: Optimized prompt loading with in-memory caching
- **Technology Date Validation**: Ensures technologies mentioned in experience existed during job periods
- **ATS Optimization**: Targets 95%+ ATS compatibility score
- **Dark/Light Theme**: User-friendly interface with theme switching
- **Template Preview**: Preview all available resume templates before generation

## 📁 Project Structure

```
Hunting-Job/
├── lib/                          # Core library files
│   ├── ai-service.js             # AI API integration (Claude/OpenAI)
│   ├── models.js                 # Available AI models configuration
│   ├── role-detector.js          # Role detection from job descriptions
│   ├── profile-template-mapping.js  # Profile to template/prompt mapping
│   ├── prompt-loader.js          # Prompt template loading utility
│   ├── pdf-templates/            # PDF resume templates
│   │   ├── index.js              # Template registry
│   │   ├── TemplateBase.js       # Base template class
│   │   ├── ResumeTemplate.js     # Default resume template
│   │   ├── templates/            # Individual template components
│   │   │   ├── ResumeTechTeal.js
│   │   │   ├── ResumeModernGreen.js
│   │   │   ├── ResumeCorporateSlate.js
│   │   │   ├── ResumeCreativeBurgundy.js
│   │   │   ├── ResumeExecutiveNavy.js
│   │   │   ├── ResumeClassicCharcoal.js
│   │   │   ├── ResumeConsultantSteel.js
│   │   │   ├── ResumeBoldEmerald.js
│   │   │   └── ResumeAcademicPurple.js
│   │   └── utils.js              # Template utilities
│   └── prompts/                  # AI prompt templates
│       ├── default.txt           # Default/general purpose prompt
│       ├── frontend.txt          # Frontend/UI specialization
│       ├── backend.txt           # Backend/server-side specialization
│       ├── fullstack.txt        # Full-stack specialization
│       ├── devops.txt           # DevOps/infrastructure specialization
│       ├── data-science.txt     # Data science/ML specialization
│       ├── mobile.txt           # Mobile app development specialization
│       ├── qa.txt               # QA/testing specialization
│       ├── security.txt         # Cybersecurity specialization
│       ├── salesforce.txt       # Salesforce/CRM specialization
│       ├── sap.txt             # SAP ERP specialization
│       └── product-manager.txt  # Product management specialization
│
├── pages/                        # Next.js pages
│   ├── index.js                 # Home page (profile selection)
│   ├── [profile].js             # Profile-specific resume generation page
│   ├── preview.js               # Template preview page
│   └── api/                     # API routes
│       ├── generate.js          # Main resume generation endpoint
│       ├── preview.js           # Template preview endpoint
│       ├── profiles.js          # List all profiles
│       ├── profiles/
│       │   └── [id].js         # Get specific profile data
│       ├── templates.js         # List all templates
│       └── resume-list.js      # List resume files
│
├── resumes/                      # Candidate profile data (JSON)
│   ├── _template.json          # Profile template structure
│   ├── Boris_Varbanov.json
│   ├── Christian_Carrasco.json
│   ├── Jose_Martin.json
│   ├── Kyle_Garcia.json
│   ├── Lucas_Moura.json
│   └── Pavlo_Vorchylo.json
│
├── package.json                 # Dependencies and scripts
├── vercel.json                  # Vercel deployment configuration
├── render.yaml                  # Render.com deployment configuration
└── .gitignore                   # Git ignore rules
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14.1.0**: React framework with server-side rendering
- **React 18.2.0**: UI library
- **@react-pdf/renderer 3.4.4**: PDF generation

### Backend
- **Node.js 20.x**: Runtime environment
- **Next.js API Routes**: Serverless API endpoints

### AI Services
- **@anthropic-ai/sdk 0.32.1**: Claude AI integration
- **openai 4.20.0**: OpenAI integration

### Deployment
- **Vercel**: Primary hosting platform (120s timeout)
- **Render.com**: Alternative deployment option

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- API keys for AI services:
  - `ANTHROPIC_API_KEY` (for Claude)
  - `OPENAI_API_KEY` (optional, for OpenAI)
  - `ANTHROPIC_MODEL` (optional, defaults to claude-haiku-4-5-20251001)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hunting-Job
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key
   OPENAI_API_KEY=your_openai_api_key  # Optional
   ANTHROPIC_MODEL=claude-haiku-4-5-20251001  # Optional
   ```

4. **Add candidate profiles**
   - Place JSON profile files in the `resumes/` directory
   - Follow the structure in `resumes/_template.json`
   - Update `lib/profile-template-mapping.js` to map profile slugs

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📖 Usage

### Generating a Resume

1. **Navigate to the home page** (`/`)
2. **Enter a profile ID** (e.g., "bv", "cc", "jm")
3. **Fill in the form**:
   - **Job Description**: Paste the complete job description
   - **Role Name**: Enter the job title (required)
   - **Company Name**: Enter company name (optional, used in filename)
4. **Click "Generate Resume PDF"**
5. **Wait for generation** (typically 30-60 seconds)
6. **Download the PDF** automatically

### Profile Structure

Each profile JSON file should follow this structure:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "location": "San Francisco, CA 94102",
  "postalCode": "94102",
  "title": "Senior Software Engineer",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "experience": [
    {
      "company": "Tech Corp",
      "title": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "start_date": "01/2021",
      "end_date": "Present",
      "details": [
        "Built scalable microservices...",
        "Led team of 5 engineers..."
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "University of California",
      "start_year": "2013",
      "end_year": "2017",
      "grade": "3.8"
    }
  ]
}
```

## 🔌 API Endpoints

### POST `/api/generate`
Generates a resume PDF based on job description.

**Request Body:**
```json
{
  "profile": "bv",              // Profile slug
  "jd": "Job description...",    // Job description text
  "roleName": "Senior Engineer", // Job title (required)
  "companyName": "Tech Corp",   // Company name (optional)
  "provider": "claude",         // AI provider: "claude" or "openai"
  "model": null                 // Model ID (optional, uses default)
}
```

**Response:**
- Success: PDF file download
- Error: JSON error message

**Validation:**
- Rejects hybrid/onsite positions (remote-only)
- Rejects entry-level positions (mid-level+ only)

### GET `/api/preview?template=Resume-Tech-Teal`
Preview a resume template with sample data.

### GET `/api/profiles`
List all available profiles.

### GET `/api/profiles/[id]`
Get specific profile data.

### GET `/api/templates`
List all available resume templates.

## 🎯 Role Detection

The system automatically detects the role type from job descriptions:

### Supported Roles
- **Frontend**: React, Vue, Angular, UI/UX
- **Backend**: Node.js, Python, APIs, microservices
- **Full-Stack**: End-to-end development
- **DevOps**: Infrastructure, CI/CD, cloud
- **Data Science**: ML, analytics, data pipelines
- **Mobile**: iOS, Android, React Native, Flutter
- **QA**: Test automation, quality assurance
- **Security**: Cybersecurity, information security
- **Salesforce**: CRM, Salesforce platform
- **SAP**: ERP, SAP modules
- **Product Manager**: Product strategy, roadmap

### Detection Process
1. Analyzes job description text
2. Matches keywords against role patterns
3. Calculates weighted scores
4. Selects highest-scoring role
5. Uses role-specific prompt template

**Detection Time**: <10ms (negligible impact)

## 📝 Prompt Templates

Each role has a specialized prompt template that:
- Focuses on role-specific keywords
- Emphasizes relevant technologies
- Uses role-appropriate metrics
- Targets ATS optimization (95%+ score)

### Prompt Priority
1. Role-based prompt (e.g., `frontend.txt`)
2. Profile-specific prompt (from mapping)
3. Default prompt (`default.txt`)

## ⚡ Performance

### Generation Time
- **Typical**: 30-60 seconds
- **Fast**: 20-30 seconds (Claude Haiku)
- **Slow**: 60-90 seconds (larger models)
- **Timeout**: 120 seconds (maximum)

### Time Breakdown
- AI API Call: 20-50 seconds (main bottleneck)
- PDF Rendering: 2-5 seconds
- File Operations: <2 seconds
- Role Detection: <10ms (negligible)
- Other Processing: <3 seconds

### Optimizations
- Prompt caching (in-memory)
- Async file operations
- Streaming PDF generation
- Efficient role detection

## 🎨 Resume Templates

### Available Templates
1. **Resume** (Classic Default)
2. **Resume-Tech-Teal** - Modern tech-focused design
3. **Resume-Modern-Green** - Contemporary green theme
4. **Resume-Corporate-Slate** - Professional corporate style
5. **Resume-Creative-Burgundy** - Creative industry design
6. **Resume-Executive-Navy** - Executive-level format
7. **Resume-Classic-Charcoal** - Traditional black/white
8. **Resume-Consultant-Steel** - Consulting industry style
9. **Resume-Bold-Emerald** - Bold emerald green
10. **Resume-Academic-Purple** - Academic/research format

### Template Selection
- Automatically assigned per profile in `profile-template-mapping.js`
- Can be overridden via API parameter
- Preview available at `/preview` page

## 🔧 Configuration

### Profile Mapping (`lib/profile-template-mapping.js`)
```javascript
{
  "bv": {
    resume: "Boris_Varbanov",
    template: "Resume-Tech-Teal",
    prompt: "default"
  }
}
```

### AI Models (`lib/models.js`)
- Configures available models per provider
- Sets default models
- Supports Claude and OpenAI models

### Role Patterns (`lib/role-detector.js`)
- Keyword patterns for each role
- Weight adjustments for better detection
- Special handling (e.g., fullstack detection)

## 🚢 Deployment

### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

**Configuration** (`vercel.json`):
- Max duration: 120 seconds
- Framework: Next.js
- Region: iad1

### Render.com
1. Connect repository
2. Set environment variables
3. Configure build/start commands

**Configuration** (`render.yaml`):
- Node version: 20.11.0
- Build command: `npm install && npm run build`
- Start command: `npm start`

## 📊 Features Summary

### Job Description Validation
- ✅ Remote-only positions
- ✅ Mid-level and senior roles
- ❌ Rejects hybrid/onsite
- ❌ Rejects entry-level/internships

### ATS Optimization
- Exact JD keyword matching
- Technology version matching
- Domain keyword integration
- Natural language flow
- Strong metrics emphasis

### User Experience
- Dark/light theme toggle
- Real-time generation timer
- Quick copy buttons for profile data
- Template preview functionality
- Responsive design

## 🔒 Security Notes

- API keys stored in environment variables
- No sensitive data in codebase
- Profile data stored locally (not in database)
- No user authentication (single-user system)

## 📚 Additional Resources

### Profile Data Format
See `resumes/_template.json` for complete structure.

### Adding New Roles
1. Add role pattern to `lib/role-detector.js`
2. Create prompt template in `lib/prompts/[role].txt`
3. Update `getPromptForRole()` mapping

### Adding New Templates
1. Create template component in `lib/pdf-templates/templates/`
2. Register in `lib/pdf-templates/index.js`
3. Add to template list in `pages/api/templates.js`

## 🐛 Troubleshooting

### Common Issues

**Generation timeout**
- Reduce job description length
- Use faster model (Claude Haiku)
- Check API key validity

**Role not detected**
- Add more keywords to role patterns
- Check job description contains role keywords
- Falls back to default prompt

**PDF generation fails**
- Check profile JSON structure
- Verify template exists
- Check console logs for errors

## 📄 License

Private project - All rights reserved

## 🔄 Version

**Current Version**: 1.0.0

**Node Version**: 20.x

**Next.js Version**: 14.1.0

---

**Note**: This is a private resume generation tool. Ensure API keys are kept secure and not committed to version control.
