// Smooth scrolling for navigation and buttons
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Scroll-to-top button
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
    toTop.style.display = window.scrollY > 400 ? 'flex' : 'none';
});
toTop.addEventListener('click', () => {
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
});

// Progress bar update on scroll
document.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrolled = window.scrollY;
    const progressPercentage = (scrolled / (documentHeight - windowHeight)) * 100;
    document.querySelector('.progress-bar').style.width = `${progressPercentage}%`;
});

// Project filtering
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filters button');
    const projectCards = document.querySelectorAll('.cards.projects .card');
    const foundText = document.querySelector('.found-text');
    const cliHeader = document.querySelector('#projects .cli-header');

    function updateFoundText(count, filter) {
        if (foundText) {
            foundText.textContent = `Found ${count} projects matching filter "${filter.toLowerCase()}"`;
        }
    }

    function updateCliHeader(filter) {
        if (cliHeader) {
            cliHeader.textContent = `$ find /projects -type project -filter "${filter.toLowerCase()}" -format card`;
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter projects
            let visibleCount = 0;
            projectCards.forEach(card => {
                const categories = card.dataset.category.split(' ');
                const isVisible = filter === 'All' || categories.includes(filter);
                card.style.display = isVisible ? 'block' : 'none';
                if (isVisible) visibleCount++;
            });

            // Update terminal output
            updateFoundText(visibleCount, filter);
            updateCliHeader(filter);
        });
    });

    // Initial count
    updateFoundText(projectCards.length, 'all');
});

// Skills category switching
document.addEventListener('DOMContentLoaded', () => {
    const categoryCards = document.querySelectorAll('.category-card');
    const detailCards = document.querySelectorAll('.detail-card');
    const cliHeader = document.getElementById('cli-header');

    // Set AI & Machine Learning as default selected category
    const defaultCategory = 'AI & Machine Learning';
    categoryCards.forEach(card => {
        if (card.dataset.category === defaultCategory) {
            card.classList.add('active');
        }
    });

    // Show only AI & ML skills by default
    detailCards.forEach(card => {
        if (card.dataset.category === defaultCategory) {
            card.style.display = 'block';
            card.classList.add('active');
            initSkillBars(card);
        } else {
            card.style.display = 'none';
            card.classList.remove('active');
        }
    });

    // Set initial CLI header
    if (cliHeader) {
        cliHeader.textContent = `get_skills --category="${defaultCategory}" --format=detailed`;
    }

    // Category card click handler
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryName = card.dataset.category;
            
            // If clicking already active card, do nothing
            if (card.classList.contains('active')) {
                return;
            }

            // Remove active class from all cards
            categoryCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            card.classList.add('active');

            // Show only selected category's skills
            detailCards.forEach(detailCard => {
                if (detailCard.dataset.category === categoryName) {
                    detailCard.style.display = 'block';
                    setTimeout(() => {
                        detailCard.classList.add('active');
                        initSkillBars(detailCard);
                    }, 50);
                } else {
                    detailCard.classList.remove('active');
                    detailCard.style.display = 'none';
                }
            });

            // Update CLI header
            if (cliHeader) {
                cliHeader.textContent = `get_skills --category="${categoryName}" --format=detailed`;
            }
        });
    });
});

// About section content switching
document.addEventListener('DOMContentLoaded', function() {
    const optionItems = document.querySelectorAll('.option-item');
    const responseBox = document.getElementById('about-response');
    const commandBox = document.getElementById('about-command');
    
    optionItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            optionItems.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            const contentType = this.getAttribute('data-content');
            let content = '';
            let command = '';
            
            // Hide all content sections first
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
            });
            
            switch(contentType) {
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
                            <h4>Bachelor's in Computer Science & Engineering</h4>
                            <span class="institution">Sreenidhi Institute of Science and Technology</span>
                            <a href="https://arxiv.org/abs/2305.12345" target="_blank" class = "education-period">View Publication</a>
                        </div>

                        <div class="education-item">
                            <i class="fas fa-file-alt gradient-text"></i>
                            <h4>Master's in IEM</h4>
                            <span class="institution">NIT Calicut</span>
                            <a href="https://arxiv.org/abs/2305.12345" target="_blank" class = "education-period">View Publication</a>
                        </div>
                    </div>`;
                    break;
            }
            
            if (responseBox) {
                responseBox.innerHTML = content;
                responseBox.scrollTop = 0;
            }
            
            if (commandBox) {
                commandBox.textContent = command;
            }
        });
    });
    
    // Trigger click on first option to show initial content
    const firstOption = document.querySelector('.option-item');
    if (firstOption) {
        firstOption.click();
    }
});

// Helper function to update CLI header
function updateCliHeader(category) {
    const cliHeader = document.querySelector('#cli-header');
    if (cliHeader && category) {
        cliHeader.textContent = `get_skills --category="${category}" --format=detailed`;
    }
}

// Helper function for section scrolling from option items
window.scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
};

// Navbar background opacity on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    const opacity = Math.min(window.scrollY / 200, 0.95);
    nav.style.backgroundColor = `rgba(15,15,24,${opacity})`;
});

// Initialize skill bars with animation
function initSkillBars(container) {
    const skillBars = container.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
        const fillBar = bar.querySelector('.skill-bar-fill');
        
        if (fillBar) {
            const targetWidth = fillBar.style.width;
            fillBar.style.transition = 'none';
            fillBar.style.width = '0';
            // Force reflow
            fillBar.offsetHeight;
            fillBar.style.transition = 'width 1s ease-out';
            requestAnimationFrame(() => {
                fillBar.style.width = targetWidth;
            });
        }
    });
}

// Intersection Observer for revealing sections
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('hidden');
            entry.target.classList.add('visible');
            // Once the section is revealed, we don't need to observe it anymore
            sectionObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections with 'hidden' class
document.querySelectorAll('section.hidden').forEach(section => {
    sectionObserver.observe(section);
});

// Education section scroll reveal
const educationSection = document.querySelector('#education');
const educationItems = document.querySelectorAll('.education-item');

const educationObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const educationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, educationObserverOptions);

// Observe each education item
educationItems.forEach(item => {
    item.style.opacity = '0';
    educationObserver.observe(item);
});

// Add hover effects for education items
educationItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const icon = item.querySelector('i');
        icon.style.transform = 'scale(1.2) rotate(5deg)';
    });

    item.addEventListener('mouseleave', () => {
        const icon = item.querySelector('i');
        icon.style.transform = 'scale(1) rotate(0)';
    });
});

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', () => {
    initSkillBars();
    // Make sure nav is visible initially
    document.querySelector('nav').classList.remove('hidden');
});

// Role text animation
document.addEventListener('DOMContentLoaded', () => {
    const typingContainer = document.querySelector('.typing-container');
    const roleText = typingContainer.querySelector('.role-text');
    const roles = ['An ML Engineer', 'A Gen AI Developer', 'A Finance Enthusiast'];
    let currentIndex = 0;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function typeText(text) {
        // Clear and reset
        roleText.className = 'role-text';
        typingContainer.style.opacity = '1';
        roleText.textContent = '';
        
        // Type each character
        for (let i = 0; i < text.length; i++) {
            roleText.textContent += text[i];
            await sleep(100);
        }
        
        // Pause after typing
        await sleep(1000);
        
        // Add strikethrough
        roleText.classList.add('striking');
        await sleep(500);
        
        // Fade out strikethrough and text together
        roleText.classList.add('fade-out');
        typingContainer.style.opacity = '0';
        await sleep(300);
    }

    async function updateRole() {
        while (true) {
            await typeText(roles[currentIndex]);
            currentIndex = (currentIndex + 1) % roles.length;
        }
    }

    updateRole();
});