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
            content = `Hello! I'm an AI & ML Engineer with a passion for building intelligent systems.

                I specialize in designing and implementing NLP, Computer Vision, and Deep Learning solutions that push the boundaries of what's possible.

                My goal is to create AI systems that are both technically impressive and ethically sound.`;
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

    async function typeText(text) {
        roleText.className = 'role-text';
        container.style.opacity = '1';
        roleText.textContent = '';
        
        // Type characters
        for (let char of text) {
            roleText.textContent += char;
            await sleep(100);
        }
        
        await sleep(1000);
        
        roleText.classList.add('striking');
        await sleep(500);
        
        roleText.classList.add('fade-out');
        container.style.opacity = '0';
        await sleep(300);
    }

    while (true) {
        await typeText(roles[currentIndex]);
        currentIndex = (currentIndex + 1) % roles.length;
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