document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
});

let editingProjectId = null;

function previewImage(input) {
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
    }
}

function removeImagePreview() {
    const input = document.getElementById('image');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    
    input.value = '';
    previewImg.src = '';
    previewContainer.style.display = 'none';
}

function previewBanner(input) {
    const previewContainer = document.getElementById('banner-preview-container');
    const previewImg = document.getElementById('banner-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
    }
}

function removeBannerPreview() {
    const input = document.getElementById('image');
    const previewContainer = document.getElementById('banner-preview-container');
    const previewImg = document.getElementById('banner-preview');
    
    input.value = '';
    previewImg.src = '';
    previewContainer.style.display = 'none';
}

function previewMultipleImages(input) {
    const previewContainer = document.getElementById('preview-images-container');
    const previewGrid = document.getElementById('preview-grid');
    
    if (input.files && input.files.length > 0) {
        previewGrid.innerHTML = '';
        
        Array.from(input.files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imgContainer = document.createElement('div');
                    imgContainer.style.cssText = 'position: relative; border: 1px solid #64748b; border-radius: 8px; overflow: hidden;';
                    
                    imgContainer.innerHTML = `
                        <img src="${e.target.result}" style="width: 100%; height: 100px; object-fit: cover; display: block;">
                        <button type="button" onclick="removePreviewImage(${index})" style="position: absolute; top: 5px; right: 5px; background: rgba(220, 38, 38, 0.8); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    previewGrid.appendChild(imgContainer);
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
}

function removePreviewImage(index) {
    const input = document.getElementById('preview-images');
    const dt = new DataTransfer();
    
    Array.from(input.files).forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    input.files = dt.files;
    previewMultipleImages(input);
}

function removeAllPreviews() {
    const input = document.getElementById('preview-images');
    const previewContainer = document.getElementById('preview-images-container');
    
    input.value = '';
    previewContainer.style.display = 'none';
}

function showAddForm() {
    document.getElementById('add-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Create New Project';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Save Project';
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('current-banner').style.display = 'none';
    editingProjectId = null;
    
    // Reset banner and preview images
    removeBannerPreview();
    removeAllPreviews();
    
    // Reset GitHub and Live URL fields
    document.getElementById('has-github').checked = false;
    document.getElementById('has-live').checked = false;
    toggleGithubField();
    toggleLiveField();
}

function showEditForm(project) {
    document.getElementById('add-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Edit Project';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Project';
    
    // Fill form with project data
    document.getElementById('project-id').value = project._id;
    document.getElementById('title').value = project.title;
    document.getElementById('description').value = project.description;
    document.getElementById('technologies').value = project.technologies.join(', ');
    document.getElementById('featured').checked = project.featured;
    
    // Handle GitHub URL
    if (project.githubUrl) {
        document.getElementById('has-github').checked = true;
        document.getElementById('githubUrl').value = project.githubUrl;
        toggleGithubField();
    } else {
        document.getElementById('has-github').checked = false;
        toggleGithubField();
    }
    
    // Handle Live URL
    if (project.liveUrl) {
        document.getElementById('has-live').checked = true;
        document.getElementById('liveUrl').value = project.liveUrl;
        toggleLiveField();
    } else {
        document.getElementById('has-live').checked = false;
        toggleLiveField();
    }
    
    // Reset banner and preview images first
    removeBannerPreview();
    removeAllPreviews();
    
    // Show current banner info
    if (project.imageUrl) {
        document.getElementById('current-banner').style.display = 'block';
        document.getElementById('current-banner-name').textContent = project.imageUrl.split('/').pop();
        
        // Show current banner as preview
        const previewImg = document.getElementById('banner-preview');
        const previewContainer = document.getElementById('banner-preview-container');
        previewImg.src = project.imageUrl;
        previewContainer.style.display = 'block';
        
        // Change remove button text for existing banner
        const removeBtn = previewContainer.querySelector('button');
        removeBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Preview';
    } else {
        document.getElementById('current-banner').style.display = 'none';
    }
    
    editingProjectId = project._id;
}

function toggleGithubField() {
    const checkbox = document.getElementById('has-github');
    const urlField = document.getElementById('githubUrl');
    
    if (checkbox.checked) {
        urlField.style.display = 'block';
        urlField.required = true;
    } else {
        urlField.style.display = 'none';
        urlField.required = false;
        urlField.value = '';
    }
}

function toggleLiveField() {
    const checkbox = document.getElementById('has-live');
    const urlField = document.getElementById('liveUrl');
    
    if (checkbox.checked) {
        urlField.style.display = 'block';
        urlField.required = true;
    } else {
        urlField.style.display = 'none';
        urlField.required = false;
        urlField.value = '';
    }
}

function hideAddForm() {
    document.getElementById('add-form').style.display = 'none';
    document.getElementById('project-form').reset();
    removeBannerPreview();
    removeAllPreviews();
    editingProjectId = null;
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Only include GitHub URL if checkbox is checked
    if (!document.getElementById('has-github').checked) {
        formData.delete('githubUrl');
    }
    
    // Only include Live URL if checkbox is checked
    if (!document.getElementById('has-live').checked) {
        formData.delete('liveUrl');
    }
    
    try {
        let url = '/admin/projects';
        let method = 'POST';
        
        if (editingProjectId) {
            url = `/admin/projects/${editingProjectId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            hideAddForm();
            loadProjects();
            alert(editingProjectId ? 'Project successfully updated!' : 'Project successfully added!');
        } else {
            alert('Error saving project: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        const projectsList = document.getElementById('projects-list');
        if (!projectsList) return;
        
        projectsList.innerHTML = '';
        
        projects.forEach(project => {
            const projectItem = createProjectItem(project);
            projectsList.appendChild(projectItem);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function createProjectItem(project) {
    const item = document.createElement('div');
    item.className = 'project-item';
    
    const techTags = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    // Format description to preserve line breaks
    const formattedDescription = project.description
        .replace(/\n/g, '<br>')
        .replace(/\r/g, '');
    
    item.innerHTML = `
        <div class="project-info">
            <h4>${project.title}</h4>
            <p>${formattedDescription}</p>
            <div class="project-tech">${techTags}</div>
            ${project.featured ? '<span class="project-featured"><i class="fas fa-star"></i> Featured</span>' : ''}
        </div>
        <div class="project-actions">
            <button class="btn btn-secondary" onclick="editProject('${project._id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="deleteProject('${project._id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return item;
}

async function editProject(projectId) {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const project = projects.find(p => p._id === projectId);
        
        if (project) {
            showEditForm(project);
        } else {
            alert('Project not found');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading project');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Weet je zeker dat je dit project wilt verwijderen?')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadProjects();
            alert('Project succesvol verwijderd!');
        } else {
            alert('Fout bij verwijderen project: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Er is een fout opgetreden');
    }
}

async function logout() {
    try {
        const response = await fetch('/admin/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/admin';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
