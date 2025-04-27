// Utility functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// DOM helper functions 
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// Create a single IntersectionObserver instance for all animations
const animationObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.classList.remove('hidden');
                target.classList.add('visible');
                
                // Special handling for skill bars in visible detail cards
                if (target.classList.contains('detail-card') && target.classList.contains('active')) {
                    initSkillBars(target);
                }
                
                // Special handling for education items
                if (target.classList.contains('education-item')) {
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }
                
                observer.unobserve(target);
            }
        });
    },
    { 
        threshold: 0.2,
        rootMargin: '0px'
    }
);

// Initialize all animations and event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Observe all elements that need animations
    $$('section.hidden, .detail-card, .education-item').forEach(el => {
        if (el.classList.contains('education-item')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        }
        animationObserver.observe(el);
    });
    
    initSmoothScrolling();
    initScrollProgress();
    initSkillsSection();
    initProjectFilters();
    initAboutSection();
    initRoleTextAnimation();
    initScrollToTop();
    initProjectModal();
});

// Navigation and scrolling
function initSmoothScrolling() {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            $(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Scroll progress and nav background
function initScrollProgress() {
    const nav = $('nav');
    
    window.addEventListener('scroll', () => {
        // Update progress bar
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / (documentHeight - windowHeight)) * 100;
        $('.progress-bar').style.width = `${progress}%`;
        
        // Update nav background
        const opacity = Math.min(scrolled / 200, 0.95);
        nav.style.backgroundColor = `rgba(15,15,24,${opacity})`;
    });
}

// Skills section functionality
function initSkillsSection() {
    const categoryCards = $$('.category-card');
    const detailCards = $$('.detail-card');
    const cliHeader = $('#cli-header');
    const defaultCategory = 'AI & Machine Learning';

    // Set default active category
    categoryCards.forEach(card => {
        if (card.dataset.category === defaultCategory) {
            card.classList.add('active');
            showSkillDetails(card.dataset.category);
        }
    });

    // Category click handler
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) return;
            
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            showSkillDetails(card.dataset.category);
        });
    });

    function showSkillDetails(category) {
        detailCards.forEach(card => {
            if (card.dataset.category === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.classList.add('active');
                    initSkillBars(card);
                }, 50);
            } else {
                card.classList.remove('active');
                card.style.display = 'none';
            }
        });
        
        if (cliHeader) {
            cliHeader.textContent = `get_skills --category="${category}" --format=detailed`;
        }
    }
}

// Initialize skill bar animations
function initSkillBars(container) {
    // Get all skill bars at once to minimize DOM queries
    const skillBars = container.querySelectorAll('.skill-bar');
    
    // Use a single rAF for better performance
    requestAnimationFrame(() => {
        skillBars.forEach(bar => {
            const fillBar = bar.querySelector('.skill-bar-fill');
            if (!fillBar) return;
            
            // Get width and future percentage from inline styles/data attributes
            const targetWidth = fillBar.style.width;
            
            // Reset width
            fillBar.style.transition = 'none';
            fillBar.style.width = '0';
            
            // Force reflow
            fillBar.offsetHeight;
            
            // Set transition and animate to target width
            fillBar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            fillBar.style.width = targetWidth;
            
            // Add future glow if data-future is present
            const futurePercent = fillBar.getAttribute('data-future');
            if (futurePercent) {
                const currentPercent = parseInt(targetWidth);
                const futureDiff = parseInt(futurePercent) - currentPercent;
                // Set a CSS custom property for the glow width
                if (futureDiff > 0) {
                    fillBar.style.setProperty('--future-width', `${futureDiff}%`);
                }
            }
        });
    });
}

// Projects section filtering
function initProjectFilters() {
    const filterBtns = $$('.filters button');
    const projectCards = $$('.cards.projects .card');
    const foundText = $('.found-text');
    const cliHeader = $('#projects .cli-header');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let visibleCount = 0;
            projectCards.forEach(card => {
                const categories = card.dataset.category.split(' ');
                const isVisible = filter === 'All' || categories.includes(filter);
                card.style.display = isVisible ? 'block' : 'none';
                if (isVisible) visibleCount++;
            });

            updateProjectUI(filter, visibleCount);
        });
    });

    function updateProjectUI(filter, count) {
        if (foundText) {
            foundText.textContent = `Found ${count} projects matching filter "${filter.toLowerCase()}"`;
        }
        if (cliHeader) {
            cliHeader.textContent = `$ find /projects -type project -filter "${filter.toLowerCase()}" -format card`;
        }
    }

    // Set initial state
    updateProjectUI('all', projectCards.length);
}

// About section content switching
function initAboutSection() {
    const optionItems = $$('.option-item');
    const responseBox = $('#about-response');
    const commandBox = $('#about-command');
    
    optionItems.forEach(item => {
        item.addEventListener('click', function() {
            optionItems.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            updateAboutContent(this.getAttribute('data-content'));
        });
    });

    // Show initial content
    $('.option-item')?.click();
}

function updateAboutContent(contentType) {
    const responseBox = $('#about-response');
    const commandBox = $('#about-command');
    let command, content;

    switch (contentType) {
        case 'about':
            command = '> Tell me about yourself';
            content = `Hello! I'm an AI & ML Engineer passionate about building intelligent, real-world solutions.

                       I specialize in designing and deploying Generative AI systems, LLM-powered agents, and Retrieval-Augmented Generation (RAG) workflows.

                       My work focuses on creating scalable, adaptive, and user-centric AI applications that bridge the gap between cutting-edge research and impactful product experiences.
                        
                       I am driven by a curiosity for innovation, a commitment to continuous learning, and a strong belief in building AI systems that are not just technically powerful, but also responsible and user-aligned.`;
            break;
            
        case 'education':
            command = '> Tell me about your education';
            content = `<div class="education-content">
                <div class="education-item">
                    <i class="fas fa-graduation-cap gradient-text"></i>
                    <h4>Master's in IEM</h4>
                    <span class="institution">NIT Calicut</span>
                    <div class="education-period">2021 - 2023</div>
                </div>

                <div class="education-item">
                    <i class="fas fa-award gradient-text"></i>
                    <h4>GCP PMLE</h4>
                    <span class="institution">Professional Machine Learning Engineer Certification</span>
                </div>

                <div class="education-item">
                    <i class="fas fa-award gradient-text"></i>
                    <h4>GCP ACE</h4>
                    <span class="institution">Associate Cloud Engineer Certification</span>
                </div>
            </div>`;
            break;
            
        case 'publications':
            command = '> List your publications';
            content = `<div class="publications-content">
                <div class="education-item">
                    <i class="fas fa-file-alt gradient-text"></i>
                    <h4>Emotions at the Heart of Learning: Exploring the Role of Teacher Emotions in Student Engagement Using Facial Emotion Recognition</h4>
                    <span class="institution">Int. J. of Innovation and Learning</span>
                    <a href="https://www.inderscienceonline.com/doi/abs/10.1504/IJIL.2025.145352" target="_blank" class="education-period">View Publication</a>
                </div>

                <div class="education-item">
                    <i class="fas fa-file-alt gradient-text"></i>
                    <h4>How do teachers’ emotions effect student sentiment in MOOCs? A study using Facial Emotion Recognition and Sentiment analysis</h4>
                    <span class="institution">Int. J. of Learning Technology</span>
                    <a href="https://www.inderscienceonline.com/doi/abs/10.1504/IJIL.2025.145352" target="_blank" class="education-period">View Publication</a>
                </div>
            </div>`;
            break;
    }

    if (commandBox) commandBox.textContent = command;
    if (responseBox) responseBox.innerHTML = content;
}

// Role text animation
async function initRoleTextAnimation() {
    const container = $('.typing-container');
    const roleText = container?.querySelector('.role-text');
    if (!container || !roleText) return;

    const roles = ['An ML Engineer', 'A Gen AI Developer', 'A Finance Enthusiast'];
    let currentIndex = 0;

    while (true) {
        const currentText = roles[currentIndex];
        
        // Type the text
        for (let i = 0; i < currentText.length; i++) {
            roleText.textContent = currentText.substring(0, i + 1);
            await sleep(100);
        }
        
        // Wait a bit when text is complete
        await sleep(2000);
        
        // Delete the text
        for (let i = currentText.length; i > 0; i--) {
            roleText.textContent = currentText.substring(0, i - 1);
            await sleep(50);  // Faster deletion
        }
        
        // Move to next role
        currentIndex = (currentIndex + 1) % roles.length;
        await sleep(500);  // Pause before next word
    }
}

// Scroll to top functionality
function initScrollToTop() {
    const toTop = $('#toTop');
    if (!toTop) return;

    window.addEventListener('scroll', () => {
        toTop.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });

    toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Project modal functionality
function initProjectModal() {
    const modal = $('#project-modal');
    const closeBtn = $('.close-modal');
    const projectLinks = $$('.project-link');

    // Project data - you can add more details for each project
    const projectData = {
        'Healthcare Insights Platform': {
            description: `An end-to-end Healthcare analytics platform along with natural language-driven insights to support strategic decision-making.`,
            techStack: ['LLMs', 'GCP', 'Agents', 'Prompt Engineering','Snowflake','Milvus', 'LangChain', 'LangGraph', 'DeepEval'],
            features: [
                'ETL pipelines for seamless data migration and transformation to Snowflake',
                'Entity extraction from enterprise data using Claude 3.5',
                'RAG using Milvus vector database',
                'Natural language query-driven insights dashboard',
                'Agentic workflows orchestrated via LangChain and LangGraph',
                'Implementation of Guardrails for safe and aligned LLM outputs',
                'Automated LLM evaluations and feedback-driven prompt improvement using DeepEval'
            ]
        },

        'Recipe Recommender Chatbot': {
            description: `A personalized recipe recommendation chatbot that suggests dishes based on users' cart items to boost engagement and basket value.`,
            techStack: ['LLMs', 'RAG', 'Prompt Engineering','Generative AI', 'Web Scraping', 'Dialogflow CX'],
            features: [
                'Natural language understanding for personalized recipe suggestions',
                'Real-time cart monitoring and contextual recommendations',
                'Takes into account user interactions during the session for smarter suggestions',
                'Enhanced user engagement through conversational interface'
            ]
        },
        "Enhancing Student Engagement through Teacher's Emotion Analysis": {
            description: `A deep learning-based system to enhance student engagement by analyzing teacher emotions and correlating them with student feedback sentiment.`,
            techStack: ['CNN', 'VGG16', 'BERT', 'NLP', 'Sentiment Analysis', 'Deep Learning'],
            features: [
                'Facial emotion recognition of teachers and students using VGG16 CNN model',
                'Sentiment analysis of student comments using BERT-CNN hybrid model',
                'Correlation analysis between teacher emotions and student engagement levels',
                'Automated insights into class dynamics and engagement patterns',
                'Aims to improve classroom experience through emotion-driven analytics'
            ]
        },
    };

    function showModal(projectTitle) {
        const project = projectData[projectTitle];
        if (!project) return;

        // Update modal content
        $('.modal-header h2').textContent = projectTitle;
        $('.project-description').textContent = project.description;
        
        // Update tech stack
        const modalTags = $('.modal-tags');
        modalTags.innerHTML = project.techStack
            .map(tech => `<span>${tech}</span>`)
            .join('');
        
        // Update features
        const featuresList = $('.features-list');
        featuresList.innerHTML = project.features
            .map(feature => `<li>${feature}</li>`)
            .join('');

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function hideModal() {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Event listeners
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const projectTitle = e.target.closest('.card').querySelector('h3').textContent;
            showModal(projectTitle);
        });
    });

    closeBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            hideModal();
        }
    });
}