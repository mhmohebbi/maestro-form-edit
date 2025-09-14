class SurveyApp {
    constructor() {
        this.formData = null;
        this.currentPageIndex = 0;
        this.responses = [];
        this.sessionId = this.generateSessionId();
        this.surveyCode = null;
        
        this.initializeElements();
        this.bindEvents();
        this.showSection('code-entry');
    }
    
    initializeElements() {
        // Main sections
        this.codeEntrySection = document.getElementById('code-entry');
        this.loadingSection = document.getElementById('loading');
        this.surveySection = document.getElementById('survey-form');
        this.completionSection = document.getElementById('completion');
        this.errorSection = document.getElementById('error');
        
        // Code entry elements
        this.surveyCodeInput = document.getElementById('survey-code');
        this.codeSubmitBtn = document.getElementById('code-submit-btn');
        this.codeError = document.getElementById('code-error');
        
        // Header elements
        this.surveyTitle = document.getElementById('survey-title');
        this.surveyDescription = document.getElementById('survey-description');
        this.progressFill = document.getElementById('progress-fill');
        this.currentPageSpan = document.getElementById('current-page');
        this.totalPagesSpan = document.getElementById('total-pages');
        
        // Form elements
        this.currentPrompt = document.getElementById('current-prompt');
        this.referenceImage = document.getElementById('reference-image');
        this.imageA = document.getElementById('image-a');
        this.imageB = document.getElementById('image-b');
        this.optionA = document.getElementById('option-a');
        this.optionB = document.getElementById('option-b');
        
        // Navigation
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        // Completion elements
        this.sessionIdSpan = document.getElementById('session-id');
        this.totalResponsesSpan = document.getElementById('total-responses');
        
        // Action buttons
        this.retryBtn = document.getElementById('retry-btn');
        
        // Error elements
        this.errorMessage = document.getElementById('error-message');
    }
    
    bindEvents() {
        // Code entry
        this.codeSubmitBtn.addEventListener('click', () => this.submitCode());
        this.surveyCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitCode();
            }
        });
        
        // Image selection
        this.optionA.addEventListener('click', () => this.selectImage('A'));
        this.optionB.addEventListener('click', () => this.selectImage('B'));
        
        // Navigation
        this.prevBtn.addEventListener('click', () => this.goToPreviousPage());
        this.nextBtn.addEventListener('click', () => this.goToNextPage());
        
        // Action buttons
        this.retryBtn.addEventListener('click', () => this.loadFormData());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.selectImage('A');
            } else if (e.key === 'ArrowRight' || e.key === 'b' || e.key === 'B') {
                this.selectImage('B');
            } else if (e.key === 'Enter') {
                if (!this.nextBtn.disabled) {
                    this.goToNextPage();
                }
            }
        });
    }
    
    async submitCode() {
        const code = this.surveyCodeInput.value.trim();
        
        if (!code) {
            this.showCodeError();
            return;
        }
        
        try {
            this.codeSubmitBtn.disabled = true;
            this.codeSubmitBtn.textContent = 'Validating...';
            this.hideCodeError();
            
            const response = await fetch('/api/validate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.valid) {
                this.surveyCode = code;
                await this.loadFormData();
            } else {
                this.showCodeError();
                this.codeSubmitBtn.disabled = false;
                this.codeSubmitBtn.textContent = 'Start Survey';
            }
        } catch (error) {
            console.error('Error validating code:', error);
            this.showError('Failed to validate code. Please check your connection and try again.');
            this.codeSubmitBtn.disabled = false;
            this.codeSubmitBtn.textContent = 'Start Survey';
        }
    }
    
    showCodeError() {
        this.codeError.style.display = 'block';
        this.surveyCodeInput.focus();
    }
    
    hideCodeError() {
        this.codeError.style.display = 'none';
    }

    async loadFormData() {
        try {
            this.showSection('loading');
            
            const response = await fetch('/api/form-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: this.surveyCode })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.formData = await response.json();
            this.initializeSurvey();
        } catch (error) {
            console.error('Error loading form data:', error);
            this.showError('Failed to load survey data. Please check your connection and try again.');
        }
    }
    
    initializeSurvey() {
        // Set header information
        this.surveyTitle.textContent = this.formData.title;
        this.surveyDescription.textContent = this.formData.description;
        this.totalPagesSpan.textContent = this.formData.pages.length;
        
        // Reset state
        this.currentPageIndex = 0;
        this.responses = [];
        
        // Show first page
        this.showCurrentPage();
        this.showSection('survey');
    }
    
    showCurrentPage() {
        const page = this.formData.pages[this.currentPageIndex];
        
        // Update page info
        this.currentPageSpan.textContent = this.currentPageIndex + 1;
        this.updateProgressBar();
        
        // Update prompt and images
        this.currentPrompt.textContent = page.prompt;
        
        // Update reference image if it exists
        if (page.referenceImage && this.referenceImage) {
            this.referenceImage.src = page.referenceImage.url;
            this.referenceImage.alt = page.referenceImage.alt;
        }
        
        this.imageA.src = page.imageA.url;
        this.imageA.alt = page.imageA.alt;
        
        this.imageB.src = page.imageB.url;
        this.imageB.alt = page.imageB.alt;
        
        // Clear previous selections
        this.clearSelection();
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentPageIndex === 0;
        this.nextBtn.disabled = true;
        this.nextBtn.textContent = this.currentPageIndex === this.formData.pages.length - 1 ? 'Submit' : 'Next';
    }
    
    selectImage(choice) {
        // Clear previous selections
        this.clearSelection();
        
        // Mark selected option
        if (choice === 'A') {
            this.optionA.classList.add('selected');
        } else {
            this.optionB.classList.add('selected');
        }
        
        // Store response
        const page = this.formData.pages[this.currentPageIndex];
        let selectedMethod = choice === 'A' ? page.imageA.method : page.imageB.method;

        const response = {
            pageId: page.id,
            prompt: page.prompt,
            selectedImage: choice,
            selectedMethod: selectedMethod,
            imageA: page.imageA.url,
            imageB: page.imageB.url,
            timestamp: new Date().toISOString()
        };
        
        // Update or add response for current page
        const existingIndex = this.responses.findIndex(r => r.pageId === page.id);
        if (existingIndex >= 0) {
            this.responses[existingIndex] = response;
        } else {
            this.responses.push(response);
        }
        
        // Enable next button
        this.nextBtn.disabled = false;
    }
    
    clearSelection() {
        this.optionA.classList.remove('selected');
        this.optionB.classList.remove('selected');
    }
    
    goToPreviousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.showCurrentPage();
            
            // Restore previous selection if exists
            const existingResponse = this.responses.find(r => r.pageId === this.formData.pages[this.currentPageIndex].id);
            if (existingResponse) {
                this.selectImage(existingResponse.selectedImage);
            }
        }
    }
    
    async goToNextPage() {
        if (this.currentPageIndex < this.formData.pages.length - 1) {
            this.currentPageIndex++;
            this.showCurrentPage();
            
            // Restore previous selection if exists
            const existingResponse = this.responses.find(r => r.pageId === this.formData.pages[this.currentPageIndex].id);
            if (existingResponse) {
                this.selectImage(existingResponse.selectedImage);
            }
        } else {
            // Submit survey
            await this.submitSurvey();
        }
    }
    
    async submitSurvey() {
        try {
            this.nextBtn.disabled = true;
            this.nextBtn.textContent = 'Submitting...';
            
            const payload = {
                sessionId: this.sessionId,
                surveyCode: this.surveyCode,
                responses: this.responses,
                completedAt: new Date().toISOString()
            };
            
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showCompletion();
        } catch (error) {
            console.error('Error submitting survey:', error);
            this.showError('Failed to submit survey. Please try again.');
            this.nextBtn.disabled = false;
            this.nextBtn.textContent = 'Submit';
        }
    }
    
    showCompletion() {
        this.sessionIdSpan.textContent = this.sessionId;
        this.totalResponsesSpan.textContent = this.responses.length;
        this.showSection('completion');
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.showSection('error');
    }
    
    showSection(sectionName) {
        // Hide all sections
        this.codeEntrySection.style.display = 'none';
        this.loadingSection.style.display = 'none';
        this.surveySection.style.display = 'none';
        this.completionSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        
        // Show requested section
        switch (sectionName) {
            case 'code-entry':
                this.codeEntrySection.style.display = 'block';
                break;
            case 'loading':
                this.loadingSection.style.display = 'block';
                break;
            case 'survey':
                this.surveySection.style.display = 'block';
                break;
            case 'completion':
                this.completionSection.style.display = 'block';
                break;
            case 'error':
                this.errorSection.style.display = 'block';
                break;
        }
    }
    
    updateProgressBar() {
        const progress = ((this.currentPageIndex + 1) / this.formData.pages.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SurveyApp();
});
