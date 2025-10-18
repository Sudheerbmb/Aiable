// Loveable Web App JavaScript
class LoveableApp {
    constructor() {
        this.isGenerating = false;
        this.currentFile = null;
        this.statusCheckInterval = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Modal close buttons
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal('file-modal');
        });

        document.getElementById('error-modal-close').addEventListener('click', () => {
            this.closeModal('error-modal');
        });

        // Download buttons
        document.getElementById('download-all-btn').addEventListener('click', () => {
            this.downloadAllFiles();
        });

        document.getElementById('download-file-btn').addEventListener('click', () => {
            this.downloadCurrentFile();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.resetApp();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('file-modal');
                this.closeModal('error-modal');
            }
        });
    }

    async handleFormSubmit() {
        if (this.isGenerating) return;

        const prompt = document.getElementById('prompt').value.trim();
        const recursionLimit = parseInt(document.getElementById('recursion-limit').value);

        if (!prompt) {
            this.showError('Please enter a project description');
            return;
        }

        this.isGenerating = true;
        this.updateGenerateButton(true);
        this.showStatusSection();
        this.hideResultsSection();

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    recursion_limit: recursionLimit
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start generation');
            }

            this.startStatusPolling();
        } catch (error) {
            this.handleError(error.message);
        }
    }

    startStatusPolling() {
        this.statusCheckInterval = setInterval(async () => {
            try {
                const response = await fetch('/status');
                const status = await response.json();

                this.updateStatus(status);

                if (!status.is_running) {
                    clearInterval(this.statusCheckInterval);
                    this.isGenerating = false;
                    this.updateGenerateButton(false);

                    if (status.error) {
                        this.handleError(status.error);
                    } else if (status.files && status.files.length > 0) {
                        this.showResults(status);
                    } else {
                        this.handleError('No files were generated');
                    }
                }
            } catch (error) {
                clearInterval(this.statusCheckInterval);
                this.isGenerating = false;
                this.updateGenerateButton(false);
                this.handleError('Failed to check generation status');
            }
        }, 1000);
    }

    updateStatus(status) {
        const statusMessage = document.getElementById('status-message');
        const statusIndicator = document.getElementById('status-indicator');
        const progressFill = document.getElementById('progress-fill');

        statusMessage.textContent = status.progress || 'Processing...';

        if (status.is_running) {
            statusIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            progressFill.style.width = '70%';
        } else {
            statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
            progressFill.style.width = '100%';
        }
    }

    showResults(status) {
        this.hideStatusSection();
        this.showResultsSection();

        // Update project title
        const projectTitle = document.getElementById('project-title');
        projectTitle.textContent = status.project_name || 'Generated Project';

        // Update file count
        const fileCount = document.getElementById('file-count');
        fileCount.textContent = `${status.files.length} file${status.files.length !== 1 ? 's' : ''}`;

        // Render files
        this.renderFiles(status.files);
    }

    renderFiles(files) {
        const filesList = document.getElementById('files-list');
        filesList.innerHTML = '';

        files.forEach(file => {
            const fileItem = this.createFileItem(file);
            filesList.appendChild(fileItem);
        });
    }

    createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.addEventListener('click', () => this.showFileContent(file));

        const fileIcon = this.getFileIcon(file.type);
        const fileSize = this.formatFileSize(file.size);

        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon ${file.type.substring(1)}">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <h5>${file.name}</h5>
                    <p>${fileSize} • ${file.type || 'text'}</p>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn" onclick="event.stopPropagation(); app.downloadFile('${file.name}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;

        return fileItem;
    }

    getFileIcon(fileType) {
        const iconMap = {
            '.html': 'fab fa-html5',
            '.css': 'fab fa-css3-alt',
            '.js': 'fab fa-js-square',
            '.py': 'fab fa-python',
            '.json': 'fas fa-code',
            '.md': 'fab fa-markdown',
            '.txt': 'fas fa-file-alt',
            '.xml': 'fas fa-file-code',
            '.yml': 'fas fa-file-code',
            '.yaml': 'fas fa-file-code'
        };

        return iconMap[fileType] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    showFileContent(file) {
        this.currentFile = file;
        
        const modal = document.getElementById('file-modal');
        const modalTitle = document.getElementById('modal-title');
        const fileContent = document.getElementById('file-content');

        modalTitle.textContent = file.name;
        fileContent.textContent = file.content;

        // Apply syntax highlighting
        Prism.highlightElement(fileContent);

        this.showModal('file-modal');
    }

    async downloadFile(filename) {
        try {
            const response = await fetch(`/download/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            this.showError('Failed to download file: ' + error.message);
        }
    }

    async downloadCurrentFile() {
        if (this.currentFile) {
            await this.downloadFile(this.currentFile.name);
        }
    }

    async downloadAllFiles() {
        try {
            const response = await fetch('/download-all');
            if (!response.ok) {
                throw new Error('Failed to download files');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated_project.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            this.showError('Failed to download project: ' + error.message);
        }
    }

    updateGenerateButton(isGenerating) {
        const button = document.getElementById('generate-btn');
        button.disabled = isGenerating;
        
        if (isGenerating) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        } else {
            button.innerHTML = '<i class="fas fa-magic"></i> Generate Project';
        }
    }

    showStatusSection() {
        document.getElementById('status-section').style.display = 'block';
    }

    hideStatusSection() {
        document.getElementById('status-section').style.display = 'none';
    }

    showResultsSection() {
        document.getElementById('results-section').style.display = 'block';
    }

    hideResultsSection() {
        document.getElementById('results-section').style.display = 'none';
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.showModal('error-modal');
    }

    handleError(error) {
        this.isGenerating = false;
        this.updateGenerateButton(false);
        this.hideStatusSection();
        this.showError(error);
    }

    resetApp() {
        // Clear form
        document.getElementById('project-form').reset();
        
        // Reset state
        this.isGenerating = false;
        this.currentFile = null;
        
        // Clear intervals
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }
        
        // Hide sections
        this.hideStatusSection();
        this.hideResultsSection();
        
        // Reset button
        this.updateGenerateButton(false);
        
        // Close modals
        this.closeModal('file-modal');
        this.closeModal('error-modal');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LoveableApp();
});

// Add some example prompts for better UX
document.addEventListener('DOMContentLoaded', () => {
    const promptTextarea = document.getElementById('prompt');
    
    // Add placeholder examples
    const examples = [
        "Build a modern todo app with dark mode, drag-and-drop functionality, and local storage",
        "Create a calculator app with a beautiful UI and keyboard support",
        "Make a weather app that shows current weather and 5-day forecast",
        "Build a simple blog with markdown support and comment system",
        "Create a portfolio website with smooth animations and responsive design"
    ];
    
    let currentExample = 0;
    
    // Cycle through examples in placeholder
    setInterval(() => {
        if (!promptTextarea.value && document.activeElement !== promptTextarea) {
            currentExample = (currentExample + 1) % examples.length;
            promptTextarea.placeholder = examples[currentExample];
        }
    }, 3000);
});
