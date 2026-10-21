/**
 * ==============================================================================
 * PORTFOLIO CONFIGURATION & DATA REPOSITORY
 * ==============================================================================
 * Central configuration file for personal information, skills, projects,
 * milestones, and contact details. Easily customize any entry below.
 */

const PORTFOLIO_DATA = {
  // Personal Brand & Identity
  personal: {
    name: "Sree Lekshmi Shaji",
    initials: "SLS",
    role: "First-Year ECE Student · Embedded Systems & IoT",
    tagline: "Building Things Where Hardware Meets Software.",
    summary:
      "A first-year Electronics and Communication Engineering student at Chennai Institute of Technology, passionate about building things where hardware meets software. Drawn to embedded systems, IoT, and applied AI.",
    availability: {
      status: "available", // "available" | "busy" | "open_for_advisory"
      text: "Open for hackathons, internships & collaborations"
    },
    location: "Chennai, India",
    timezone: "IST (UTC+5:30)",
    email: "ssreelekshmi821@gmail.com",
    social: {
      github: "https://github.com/sree-lekshmi18",
      linkedin: "https://www.linkedin.com/in/sreelekshmi-shaji-920bb942b/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BajTx0bKSQ8u1r0lVdcplgw%3D%3D",
      twitter: ""
    },
    avatar: "assets/images/profile-avatar.jpg",
    heroVisual: "assets/images/crystal-hero.jpg"
  },

  // About Me Section
  about: {
    badge: "About Me",
    title: "A Little About Me",
    subtitle: "Turning ideas into working prototypes where hardware meets software.",
    bio: [
      "I’m a first-year Electronics and Communication Engineering student at Chennai Institute of Technology, passionate about building things where hardware meets software. I’m drawn to embedded systems, IoT, and applied AI, and I like turning ideas into working prototypes.",
      "My most recent project is an ESP32-based predictive maintenance system for RO water purifiers. It combines flow, ORP, TDS, and temperature sensors with a carbon capacity model and anomaly analysis to estimate filter life and give three-level maintenance alerts. I calibrated the sensors and validated the system with accelerated aging tests.",
      "I work in Python and C, I’m growing into Embedded C, and I’m comfortable with Arduino, soldering, and datasheets. On the web side I use HTML, CSS, JavaScript, React, and SQL, and I’m learning Django.",
      "As part of my college’s Industrial Automation Centre of Excellence, I’m also getting hands-on exposure to real-world automation and teamwork. I’m looking for hackathons, internships, and collaborations where I can keep building and learning."
    ],
    education: {
      degree: "BE - Electronics & Communication Engineering",
      institution: "Chennai Institute of Technology",
      period: "First-Year Student (2026 - 2030)",
      focus: "Embedded Systems, IoT & Industrial Automation"
    },
    interests: [
      "Embedded Systems & IoT",
      "ESP32 & Microcontrollers",
      "Applied AI & Predictive Maintenance",
      "Sensors & Instrumentation",
      "Python, C & Embedded C",
      "Industrial Automation (Centre of Excellence)",
      "Web Development (React, SQL, Django)"
    ],
    values: [
      {
        title: "Hardware Meets Software",
        description: "Passionate about bridging low-level sensor telemetry, firmware, and electronics with intelligent algorithms and responsive software.",
        icon: "cpu"
      },
      {
        title: "Prototyping & Validation",
        description: "Hands-on experience calibrating sensors, designing carbon capacity models, and running accelerated aging tests on real systems.",
        icon: "activity"
      },
      {
        title: "Collaborative Growth",
        description: "Active member at the CIT Industrial Automation Centre of Excellence, constantly seeking hackathons, internships, and team challenges.",
        icon: "sparkles"
      }
    ]
  },

  // Skills & Technologies Section (5 Individual Skill Boxes)
  skills: [
    {
      category: "Programming",
      description: "Core languages for logic, firmware, algorithms, and computational systems",
      items: [
        { name: "Python", level: "", icon: "terminal" },
        { name: "C", level: "", icon: "code" },
        { name: "Embedded C", level: "learning", icon: "cpu" }
      ]
    },
    {
      category: "Web",
      description: "Frontend standards, UI styling, dynamic interfaces, and relational datastores",
      items: [
        { name: "HTML", level: "", icon: "file-code" },
        { name: "CSS", level: "", icon: "palette" },
        { name: "JavaScript", level: "", icon: "code" },
        { name: "React", level: "", icon: "layout" },
        { name: "SQL/MySQL", level: "", icon: "database" },
        { name: "Django", level: "learning", icon: "layers" }
      ]
    },
    {
      category: "Hardware & electronics",
      description: "Microcontrollers, physical prototyping, bench testing, circuit assembly, and datasheets",
      items: [
        { name: "Arduino", level: "", icon: "cpu" },
        { name: "ESP32", level: "", icon: "wifi" },
        { name: "sensors", level: "", icon: "activity" },
        { name: "soldering", level: "", icon: "tool" },
        { name: "circuit connections", level: "", icon: "git-commit" },
        { name: "component testing", level: "", icon: "check-circle-2" },
        { name: "datasheet analysis", level: "", icon: "file-text" }
      ]
    },
    {
      category: "Tools",
      description: "Primary development environments, code editors, and hardware toolchains",
      items: [
        { name: "Arduino IDE", level: "", icon: "terminal" },
        { name: "VS Code", level: "", icon: "layout-grid" }
      ]
    },
    {
      category: "Domains",
      description: "Specialized engineering focus areas spanning connected hardware and intelligent systems",
      items: [
        { name: "Embedded systems", level: "", icon: "cpu" },
        { name: "IoT", level: "", icon: "radio" },
        { name: "applied AI", level: "", icon: "sparkles" },
        { name: "predictive maintenance", level: "", icon: "trending-up" },
        { name: "industrial automation", level: "", icon: "settings" }
      ]
    }
  ],

  // Featured Projects Section
  projects: [
    {
      id: "project-1",
      title: "AI Resume Analyzer",
      category: "AI & Machine Learning",
      categoryKey: "ai",
      problemStatement: "Job seekers often face high ATS rejection rates and lack clarity on how well their resumes match specific job descriptions before applying.",
      solution: "An AI-powered multi-model resume analysis tool that compares a resume with a custom Job Description (JD) and provides an ATS-style score, skill matching, missing skills, and actionable improvement suggestions.",
      image: "assets/images/project-ai-resume.png",
      tags: [
        "Python",
        "Streamlit",
        "LangChain",
        "LLM APIs (Gemini / OpenRouter)",
        "PyPDF2",
        "JSON & Regex",
        "python-dotenv"
      ],
      features: [
        "Automated ATS score calculation comparing resume keywords against custom Job Descriptions",
        "Comprehensive skill extraction, semantic matching, and missing skills identification",
        "Actionable, personalized resume improvement recommendations powered by multi-model LLMs",
        "High-performance PDF text parsing using PyPDF2 with robust JSON & Regex schema extraction"
      ],
      githubUrl: "https://github.com/JD-Jaidev/AI-RESUME-ANALYZER",
      demoUrl: "https://multi-ai-resume-analyzer.streamlit.app/",
      featured: true
    }
  ],

  // Milestones & Experience Section (Academic & Technical Journey)
  milestones: [
    {
      id: "milestone-1",
      period: "2026 - Present",
      type: "Education",
      typeKey: "education",
      title: "BE Electronics and Communication Engineering",
      organization: "Chennai Institute of Technology",
      description: "First-year Electronics and Communication Engineering student passionate about building things where hardware meets software. Focus areas include embedded systems, IoT, applied AI, sensor integration, and real-world industrial automation as part of the college's Industrial Automation Centre of Excellence.",
      icon: "graduation-cap",
      isCurrent: true
    }
  ],

  // Collaboration Interests
  collaborationInterests: [
    "Full-Stack Web Development",
    "Open Source Contributions",
    "Software Architecture & API Design",
    "Internship / Full-Time Opportunities",
    "Technical Research & Discussions"
  ],

  // Footer Metadata
  footer: {
    closingLine: "Designed with purpose. Built with curiosity.",
    copyright: `© ${new Date().getFullYear()} Sree Lekshmi Shaji. All rights reserved.`,
    builtWith: "Strict Pure HTML5 · Modern CSS3 · Vanilla JavaScript"
  }
};

// Export for module or global use
if (typeof module !== "undefined" && module.exports) {
  module.exports = PORTFOLIO_DATA;
} else {
  window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
