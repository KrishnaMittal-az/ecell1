# 🚀 E-Cell GLA University

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/CI/CD-Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins" />
</div>

<div align="center">
  <h3>🌟 Empowering Entrepreneurs, Building the Future 🌟</h3>
  <p><em>The official website for the Entrepreneurship Cell of GLA University</em></p>
</div>

---

## ✨ What Makes Us Special

Welcome to the digital home of **E-Cell GLA University** - where innovation meets ambition! Our modern, responsive website showcases the vibrant entrepreneurial ecosystem at GLA University.

### 🎯 Key Features

- **🎨 Modern UI/UX** - Sleek, responsive design that looks stunning on all devices
- **⚡ Lightning Fast** - Optimized React components for blazing-fast performance
- **🎭 Interactive Elements** - Smooth animations and engaging user interactions
- **📱 Mobile First** - Perfectly crafted for mobile and desktop experiences
- **🔄 Auto-Deploy** - Seamless CI/CD pipeline with Jenkins and Docker

### 🛠️ Technology Stack

```javascript
const techStack = {
  // Core Framework
  frontend: {
    framework: "React 18.2.0",
    language: "JavaScript ES6+",
    buildTool: "Create React App 5.0.1",
    routing: "React Router DOM 6.22.3"
  },
  
  // UI & Styling
  styling: {
    framework: "Bootstrap 5.3.3",
    icons: "Bootstrap Icons",
    animations: "AOS (Animate On Scroll)",
    customCSS: "Responsive Design"
  },
  
  // Interactive Features
  animations: {
    counters: "React CountUp 6.5.3",
    scrolling: "React Scroll 1.9.0",
    carousels: "Swiper 11.2.8",
    marquee: "React Fast Marquee 1.6.5",
    triggers: "React Scroll Trigger 0.6.14"
  },
  
  // Development & Testing
  development: {
    testing: "Jest & React Testing Library",
    linting: "ESLint",
    performance: "Web Vitals 2.1.4"
  },
  
  // Deployment & DevOps
  deployment: {
    containerization: "Docker",
    cicd: "Jenkins Pipeline",
    registry: "DockerHub",
    hosting: "Container-based"
  },
  
  // Additional Libraries
  utilities: {
    hashLinks: "React Router Hash Link 2.4.3",
    webVitals: "Web Vitals Monitoring",
    nodeVersion: "18+ (Alpine in Docker)"
  }
};
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/KrishnaMittal-az/ecell1.git

# Navigate to project directory
cd ecell1

# Install dependencies
npm install

# Start the development server
npm start
```

🎉 **Boom!** Your development server will be live at:
- 🌐 **Local**: `http://localhost:3000`
- 📱 **Network**: `http://[your-ip]:3000` (for mobile testing)

> **💡 Pro Tip**: The development server supports hot reloading, so your changes will appear instantly!

## 🐳 Docker Deployment

```bash
# Build the Docker image
docker build -t ecell:latest .

# Run the container
docker run -d -p 3000:3000 ecell:latest
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | 🚀 Starts development server |
| `npm build` | 📦 Creates production build |
| `npm test` | 🧪 Runs test suite |
| `npm eject` | ⚠️ Ejects from Create React App |

## 📂 Repository Structure

```
ecell1/
├── 📁 build/                    # Production build output
│   ├── 📁 assets/              # Compiled assets (CSS, images, data)
│   │   ├── 📁 css/             # Compiled stylesheets
│   │   ├── 📁 data/            # JSON data files (team.json)
│   │   ├── 📁 images/          # Image assets
│   │   │   ├── 📁 gallery/     # Event gallery images (250+ photos)
│   │   │   ├── 📁 StudentCouncil/ # Team photos by tenure (1.0-11.0)
│   │   │   └── 📁 Workshops/   # Workshop & event images
│   │   ├── 📁 js/              # Compiled JavaScript
│   │   └── 📁 vendor/          # Third-party libraries (AOS, Bootstrap, etc.)
│   └── 📄 index.html           # Production HTML
├── 📁 public/                  # Static public assets
│   ├── 📁 assets/              # Public assets mirror
│   │   ├── 📄 style.css        # Custom styles
│   │   ├── 📄 team.json        # Team data
│   │   └── 📁 images/          # All images and media
│   ├── 📄 favicon.ico          # Site favicon
│   ├── 📄 index.html           # HTML template
│   └── 📄 logoorange.ico       # Orange logo favicon
├── 📁 src/                     # Source code
│   ├── 📁 components/          # Reusable React components
│   │   ├── 📄 About.js         # About E-Cell section
│   │   ├── 📄 Contact.js       # Contact form & info
│   │   ├── 📄 Counter.js       # Animated statistics counters
│   │   ├── 📄 FAQs.js          # Frequently asked questions
│   │   ├── 📄 Footer.js        # Site footer with links
│   │   ├── 📄 Gallery.js       # Image gallery component
│   │   ├── 📄 Genie.js         # Special feature showcase
│   │   ├── 📄 Hero.js          # Landing page hero section
│   │   ├── 📄 Mentors.js       # Faculty mentors showcase
│   │   ├── 📄 Navbar.js        # Navigation bar
│   │   ├── 📄 Partner.js       # Partners & sponsors
│   │   ├── 📄 Tabs.js          # Tabbed content component
│   │   ├── 📄 Team.js          # Team member cards
│   │   └── 📄 Testimonials.js  # Success stories
│   ├── 📁 pages/               # Main page components
│   │   ├── 📄 Event.jsx        # Events page
│   │   ├── 📄 Gallery.jsx      # Gallery page
│   │   ├── 📄 Home.jsx         # Homepage
│   │   └── 📄 TeamCouncil.jsx  # Team page
│   ├── 📄 index.css            # Global styles
│   ├── 📄 index.js             # React app entry point
│   └── 📄 logo.svg             # React logo
├── 📁 scripts/                 # Custom scripts (currently empty)
├── 📄 .dockerignore            # Docker ignore patterns
├── 📄 .gitignore               # Git ignore patterns
├── 📄 Dockerfile               # Container configuration
├── 📄 Jenkinsfile              # CI/CD pipeline configuration
├── 📄 package.json             # Dependencies & scripts
├── 📄 package-lock.json        # Dependency lock file
└── 📄 README.md                # This file
```

## 🛠️ How to Use This Repository

### 🎯 For Developers

#### **1. Setting Up Development Environment**

```bash
# Prerequisites check
node --version  # Should be v16+
npm --version   # Should be v8+

# Clone and setup
git clone https://github.com/KrishnaMittal-az/ecell1.git
cd ecell1

# Install all dependencies
npm install

# Start development server
npm start
```

#### **2. Development Workflow**

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
npm start  # Test locally
npm test   # Run tests

# Build for production (optional)
npm run build

# Commit and push
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

#### **3. Project Structure Explained**

| Directory | Purpose | Key Files |
|-----------|---------|----------|
| `src/components/` | Reusable UI components | `Hero.js`, `Navbar.js`, `Footer.js` |
| `src/pages/` | Main page layouts | `Home.jsx`, `Gallery.jsx`, `TeamCouncil.jsx` |
| `public/assets/` | Static assets | Images, CSS, JSON data |
| `build/` | Production build | Generated after `npm run build` |

### 🏢 For Organizations/Universities

#### **Customizing for Your Institution**

1. **Update Branding**
   ```bash
   # Replace logos in public/assets/images/
   # Update colors in src/index.css
   # Modify university name in components
   ```

2. **Team Data Management**
   ```bash
   # Edit team information
   nano public/assets/data/team.json
   
   # Add new team photos
   # Place in public/assets/images/StudentCouncil/[tenure]/
   ```

3. **Content Updates**
   ```bash
   # Update About section
   nano src/components/About.js
   
   # Modify contact information
   nano src/components/Contact.js
   
   # Update FAQ content
   nano src/components/FAQs.js
   ```

### 🚀 For Deployment

#### **Option 1: Docker Deployment**

```bash
# Build Docker image
docker build -t your-ecell:latest .

# Run container
docker run -d -p 3000:3000 your-ecell:latest

# Access at http://localhost:3000
```

#### **Option 2: Static Hosting**

```bash
# Build for production
npm run build

# Deploy 'build' folder to:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3
# - Any static hosting service
```

#### **Option 3: Jenkins CI/CD**

1. **Setup Jenkins Pipeline**
   - Use the provided `Jenkinsfile`
   - Configure DockerHub credentials
   - Set up webhook for auto-deployment

2. **Pipeline Stages**
   - 🔄 **Code**: Pulls latest from GitHub
   - 🏗️ **Build**: Creates Docker image
   - 📤 **Push**: Uploads to DockerHub
   - 🚀 **Deploy**: Deploys container

### 📸 Asset Management

#### **Adding New Photos**

```bash
# For events/gallery
public/assets/images/gallery/[event-name]/

# For team members
public/assets/images/StudentCouncil/[tenure]/[member-name].png

# For workshops
public/assets/images/Workshops/[workshop-name].jpg
```

#### **Supported Formats**
- **Images**: JPG, PNG, JPEG
- **Icons**: SVG, ICO
- **Data**: JSON

### 🎨 Customization Guide

#### **Theme Colors**
```css
/* Edit src/index.css */
:root {
  --primary-color: #ff6b35;    /* Orange theme */
  --secondary-color: #2c3e50;  /* Dark blue */
  --accent-color: #3498db;     /* Light blue */
}
```

#### **Adding New Components**
```bash
# Create new component
touch src/components/NewComponent.js

# Import in pages
# Add routing if needed
```

### 🔧 Configuration Files

| File | Purpose | Modify For |
|------|---------|------------|
| `package.json` | Dependencies & scripts | Adding new packages |
| `Dockerfile` | Container setup | Deployment config |
| `Jenkinsfile` | CI/CD pipeline | Build automation |
| `.gitignore` | Git exclusions | Ignore patterns |
| `.dockerignore` | Docker exclusions | Container optimization |

### 📱 Responsive Design

The website is fully responsive and tested on:
- 📱 **Mobile**: 320px - 768px
- 📟 **Tablet**: 768px - 1024px
- 💻 **Desktop**: 1024px+
- 🖥️ **Large Screens**: 1440px+

### 🌐 Browser Support

- ✅ **Chrome** 80+
- ✅ **Firefox** 75+
- ✅ **Safari** 13+
- ✅ **Edge** 80+

### ⚡ Performance Features

- **Code Splitting**: Automatic with React
- **Lazy Loading**: Images and components
- **Optimized Build**: Minification and compression
- **Fast Refresh**: Hot reloading in development
- **Progressive Enhancement**: Works without JavaScript

## 🌟 Website Features

### 🎯 Core Sections
- **🏠 Hero Landing** - Dynamic hero with multiple background images
- **📖 About E-Cell** - Mission, vision, and organizational values
- **👥 Team Showcase** - Interactive team cards with 11+ tenure histories
- **🧑‍🏫 Faculty Mentors** - Dedicated mentor profiles and expertise
- **🤝 Partners & Sponsors** - Corporate partnerships and collaborations
- **💬 Alumni Testimonials** - Success stories and career achievements
- **❓ FAQ Section** - Comprehensive answers to common queries
- **📞 Contact & Location** - Multiple contact methods and campus info

### ⚡ Interactive Elements
- **📊 Animated Counters** - Real-time statistics with CountUp.js
- **🎠 Image Carousels** - Swiper.js powered slideshows
- **📸 Photo Gallery** - 250+ event photos with lightbox viewing
- **🎭 Smooth Animations** - AOS (Animate On Scroll) effects
- **📱 Responsive Design** - Perfect on all devices and screen sizes
- **🔄 Fast Navigation** - Hash-based routing for smooth scrolling

### 🎨 Visual Features
- **🌈 Modern UI/UX** - Bootstrap 5 with custom styling
- **🖼️ Rich Media** - High-quality images and professional photography
- **🎯 Call-to-Actions** - Strategic placement for engagement
- **📋 Dynamic Content** - JSON-driven team and event data
- **🔧 Custom Components** - Reusable React components for consistency

## 🚀 CI/CD Pipeline

Our project features a robust Jenkins pipeline that:

1. **🔄 Clones** the latest code from GitHub
2. **🏗️ Builds** the Docker image
3. **📤 Pushes** to DockerHub
4. **🚀 Deploys** automatically to production

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make this project even better:

### 🚀 Quick Start for Contributors

1. **🍴 Fork & Clone**
   ```bash
   # Fork the repo on GitHub, then:
   git clone https://github.com/YOUR-USERNAME/ecell1.git
   cd ecell1
   npm install
   ```

2. **🌿 Create Feature Branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   # or
   git checkout -b fix/bug-description
   # or
   git checkout -b docs/documentation-update
   ```

3. **💻 Develop & Test**
   ```bash
   npm start          # Start development server
   npm test           # Run tests
   npm run build      # Test production build
   ```

4. **📝 Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   git push origin feature/your-amazing-feature
   ```

5. **🔄 Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Wait for review and feedback

### 🎯 Contribution Guidelines

#### **Code Style**
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic

#### **Commit Messages**
Use conventional commits:
```bash
feat: add new team member component
fix: resolve mobile navigation issue
docs: update installation instructions
style: improve button hover effects
refactor: optimize image loading
```

#### **What We Need Help With**
- 🐛 **Bug Fixes**: Check issues tab
- ✨ **New Features**: Propose via issues first
- 📚 **Documentation**: Always appreciated
- 🎨 **UI/UX Improvements**: Design enhancements
- ♿ **Accessibility**: Making it better for everyone
- 🔧 **Performance**: Speed and optimization
- 🧪 **Testing**: Unit and integration tests

### 📋 Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Mobile responsiveness tested
- [ ] Accessibility considerations addressed

### 🏆 Recognition

Contributors will be:
- Added to our contributors list
- Mentioned in release notes
- Given credit in the project documentation

Thank you for helping make E-Cell GLA University's website amazing! 🙌

## 📄 License & Legal

### 📜 License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🖼️ Image Rights
- Team photos and event images belong to E-Cell GLA University
- Third-party logos used with permission
- Stock images are royalty-free or Creative Commons licensed

### ⚠️ Usage Terms
- ✅ **Allowed**: Fork, modify, and use for educational purposes
- ✅ **Allowed**: Use as template for other E-Cell chapters
- ✅ **Allowed**: Contribute improvements back to the community
- ❌ **Not Allowed**: Commercial use without permission
- ❌ **Not Allowed**: Claim original ownership of the codebase

### 🛡️ Privacy & Data
- No personal data is collected by this website
- Contact form submissions are handled securely
- Images are optimized and compressed for web use
- No tracking or analytics cookies are used

## 🎯 Connect With E-Cell GLA University

<div align="center">
  <p><strong>Ready to start your entrepreneurial journey?</strong></p>
  <p>Join the E-Cell GLA University community and turn your ideas into reality!</p>
  
  ### 🌐 Find Us Online
  
  [![Website](https://img.shields.io/badge/Website-ecellgla.org-orange?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ecellgla.org)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-E--Cell%20GLA-blue?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/ecell-gla)
  [![Instagram](https://img.shields.io/badge/Instagram-@ecell__gla-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/ecell_gla)
  [![GitHub](https://img.shields.io/badge/GitHub-E--Cell%20GLA-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/KrishnaMittal-az)
  
  ---
  
  ### 📍 Visit Our Campus
  **GLA University, Mathura**  
  17km Stone, NH-2, Mathura-Delhi Road  
  Mathura, Uttar Pradesh 281406, India
  
  ---
  
  ### 💡 Questions or Ideas?
  
  - 🐛 **Found a bug?** [Open an issue](https://github.com/KrishnaMittal-az/ecell1/issues)
  - 💡 **Have a feature idea?** [Start a discussion](https://github.com/KrishnaMittal-az/ecell1/discussions)
  - 🤝 **Want to contribute?** Check our [Contributing Guide](#-contributing)
  - 📧 **General inquiries?** Use our [Contact Form](src/components/Contact.js)
  
  ---
  
  ### ⭐ Show Your Support
  
  If this project helped you or your organization, please:
  - ⭐ **Star this repository**
  - 🍴 **Fork and customize** for your own use
  - 📢 **Share** with other entrepreneurship communities
  - 🤝 **Contribute** to make it even better
  
  ---
  
  <p>Made with ❤️ by the E-Cell GLA University Team</p>
  <p><em>"The way to get started is to quit talking and begin doing." - Walt Disney</em></p>
  
  ### 🏷️ Version & License
  
  [![Version](https://img.shields.io/badge/Version-0.1.0-brightgreen?style=flat-square)](package.json)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
  [![React](https://img.shields.io/badge/Built%20with-React%2018-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
  [![Node](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
  
</div>
