document.addEventListener('DOMContentLoaded', function() {
    // Load projects
    loadProjects();
    
    // Initialize navigation
    initNavigation();
    
    // Add scroll effects
    addScrollEffects();
    
    // Initialize animations
    initAnimations();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Smooth scrolling for navigation links (except admin link)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't prevent default for external links (like admin)
            if (this.getAttribute('href').startsWith('/')) {
                return; // Let the browser handle the navigation
            }
            
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

function addScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(15, 23, 42, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
            } else {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            }
        });
    }
}

function initAnimations() {
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .skill-tag, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = '';
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #5a6c7d;">
                    <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No projects available yet. Check back soon!</p>
                </div>
            `;
            return;
        }
        
        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Error loading projects. Please try again later.</p>
                </div>
            `;
        }
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const techTags = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    // Format description to preserve line breaks
    const formattedDescription = project.description
        .replace(/\n/g, '<br>')
        .replace(/\r/g, '');
    
    const links = [];
    if (project.githubUrl) {
        links.push(`
            <a href="${project.githubUrl}" class="project-link github" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-github"></i>
                GitHub
            </a>
        `);
    }
    if (project.liveUrl) {
        links.push(`
            <a href="${project.liveUrl}" class="project-link live" target="_blank" rel="noopener noreferrer">
                <i class="fas fa-external-link-alt"></i>
                Live Demo
            </a>
        `);
    }
    
    // Create preview images gallery if available
    let previewGallery = '';
    if (project.previewImages && project.previewImages.length > 0) {
        const previewImagesHtml = project.previewImages.map(img => 
            `<img src="${img}" alt="Preview" class="preview-image" onclick="openImageModal('${img}')">`
        ).join('');
        
        previewGallery = `
            <div class="preview-gallery">
                <h4>Preview Images</h4>
                <div class="preview-images-grid">
                    ${previewImagesHtml}
                </div>
            </div>
        `;
    }
    
    card.innerHTML = `
        ${project.imageUrl ? `
            <img src="${project.imageUrl}" alt="${project.title}" class="project-image" loading="lazy">
        ` : `
            <div class="project-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                <i class="fas fa-code"></i>
            </div>
        `}
        <div class="project-content">
            ${project.featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${formattedDescription}</p>
            <div class="project-tech">${techTags}</div>
            ${previewGallery}
            ${links.length > 0 ? `<div class="project-links">${links.join('')}</div>` : ''}
        </div>
    `;
    
    return card;
}

// Function to open image modal
function openImageModal(imageSrc) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="closeImageModal()">&times;</span>
                <img id="modal-image" src="" alt="Preview">
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Set image and show modal
    document.getElementById('modal-image').src = imageSrc;
    modal.style.display = 'flex';
}

// Function to close image modal
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('image-modal');
    if (modal && e.target === modal) {
        closeImageModal();
    }
});
