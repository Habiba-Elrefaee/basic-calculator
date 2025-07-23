class Calculator {
    constructor() {
        this.expression = '';
        this.result = '';
        this.parenthesesCount = 0;
        this.isMuted = localStorage.getItem('isMuted') === 'true';
        this.isNewCalculation = false;
        
        // Get DOM elements
        this.displayExpression = document.querySelector('.expression');
        this.displayResult = document.querySelector('.result');
        this.buttonSound = document.getElementById('button-sound');
        this.parenthesesBtn = document.getElementById('parentheses');
        
        // Initialize
        this.setupEventListeners();
        this.setupKeyboardInput();
        this.setupThemeToggle();
        this.setupMuteToggle();
    }

    setupEventListeners() {
        document.querySelectorAll('.buttons button').forEach(button => {
            button.addEventListener('click', () => {
                this.playButtonSound();
                this.handleInput(button.textContent);
            });
        });
    }

    setupMuteToggle() {
        const muteBtn = document.getElementById('mute-switch');
        const soundIcon = muteBtn.querySelector('.sound-icon');
        
        // Set initial state
        soundIcon.textContent = this.isMuted ? '🔇' : '🔊';
        
        muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            localStorage.setItem('isMuted', this.isMuted);
            soundIcon.textContent = this.isMuted ? '🔇' : '🔊';
            this.playButtonSound();
        });
    }

    setupThemeToggle() {
        const themeBtn = document.getElementById('theme-switch');
        const html = document.documentElement;
        
        // Get saved theme or use system preference
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        // Set initial state
        html.setAttribute('data-theme', savedTheme);
        themeBtn.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        
        themeBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeBtn.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
            this.playButtonSound();
        });
    }

    setupKeyboardInput() {
        document.addEventListener('keydown', (e) => {
            if (/[\d\.\+\-\*\/\%\(\)\=]/.test(e.key) || 
                ['Enter', 'Backspace', 'Escape'].includes(e.key)) {
                e.preventDefault();
                this.playButtonSound();
                
                let input = e.key;
                switch(e.key) {
                    case 'Enter': input = '='; break;
                    case 'Escape': input = 'AC'; break;
                    case '*': input = '×'; break;
                    case '/': input = '÷'; break;
                    case 'Backspace': input = 'DEL'; break;
                }
                
                this.handleInput(input);
            }
        });
    }

    handleInput(value) {
        switch(value) {
            case 'AC':
                this.clear();
                break;
            case '=':
                this.calculate();
                break;
            case 'DEL':
                this.deleteLastChar();
                break;
            case '(':
            case ')':
                this.handleParentheses(value);
                break;
            default:
                this.appendInput(value);
                break;
        }
    }

    handleParentheses(value) {
        if (value === '(' && (this.expression === '' || /[\+\-\*\/\%\(]$/.test(this.expression))) {
            this.expression += '(';
            this.parenthesesCount++;
            this.parenthesesBtn.textContent = ')';
        } else if (value === ')' && this.parenthesesCount > 0 && !/[\+\-\*\/\%\(]$/.test(this.expression)) {
            this.expression += ')';
            this.parenthesesCount--;
            if (this.parenthesesCount === 0) {
                this.parenthesesBtn.textContent = '(';
            }
        }
        this.updateDisplay();
    }

    playButtonSound() {
        if (!this.isMuted && this.buttonSound) {
            this.buttonSound.currentTime = 0;
            this.buttonSound.play().catch(error => {
                console.log('Audio playback failed:', error);
            });
        }
    }

    appendInput(value) {
        const calculationValue = value
            .replace('×', '*')
            .replace('÷', '/');

        const isOperator = /[\+\-\*\/\%]/.test(calculationValue);
        const isNumber = /[\d\.]/.test(calculationValue);

        // If starting new calculation after a result
        if (this.isNewCalculation && isNumber) {
            this.expression = '';
            this.result = '';
            this.isNewCalculation = false;
        }

        if (isOperator && /[\+\-\*\/\%]$/.test(this.expression)) {
            this.expression = this.expression.slice(0, -1) + calculationValue;
        } else if (isNumber || (isOperator && this.expression !== '' && !/\($/.test(this.expression))) {
            this.expression += calculationValue;
        }

        this.updateDisplay();
    }

    calculate() {
        try {
            if (this.expression) {
                // Add missing closing parentheses if needed
                while (this.parenthesesCount > 0) {
                    this.expression += ')';
                    this.parenthesesCount--;
                }
                
                // Sanitize the expression to replace × and ÷ with * and /
                // This is necessary to ensure the expression can be evaluated correctly
                const sanitizedExpression = this.expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/');
                
                // Create a new function from the sanitized expression and execute it
                // This allows us to evaluate the mathematical expression safely
                // The expression is wrapped in a function to avoid using eval directly
                // This is a safer alternative to eval, as it only allows valid JavaScript expressions
                const result = new Function('return ' + sanitizedExpression)();
                this.result = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
                this.isNewCalculation = true;
                this.parenthesesBtn.textContent = '(';
                this.updateDisplay();
            }
        } catch (error) {
            this.result = 'Error';
            this.updateDisplay();
            setTimeout(() => this.clear(), 1500);
        }
    }

    clear() {
        this.expression = '';
        this.result = '';
        this.parenthesesCount = 0;
        this.isNewCalculation = false;
        this.parenthesesBtn.textContent = '(';
        this.updateDisplay();
    }

    deleteLastChar() {
        if (this.expression.slice(-1) === '(') {
            this.parenthesesCount--;
        } else if (this.expression.slice(-1) === ')') {
            this.parenthesesCount++;
        }
        this.expression = this.expression.slice(0, -1);
        if (this.parenthesesCount === 0) {
            this.parenthesesBtn.textContent = '(';
        } else {
            this.parenthesesBtn.textContent = ')';
        }
        this.isNewCalculation = false;
        this.updateDisplay();
    }

    updateDisplay() {
        this.displayExpression.textContent = this.expression || '0';
        // This line updates the result display with the current result.
        // If the result is empty, it will show '0' by default.
        this.displayResult.textContent = this.result;  // Remove || '0' to not show 0 in result display
    }
}

// Initialize calculator
const calculator = new Calculator();