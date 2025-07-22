class Calculator {
    constructor() {
        this.expression = '';
        this.result = '';
        this.displayExpression = document.querySelector('.expression');
        this.displayResult = document.querySelector('.result');
        this.buttonSound = document.getElementById('button-sound');
        this.setupEventListeners();
        this.setupKeyboardInput();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => this.handleInput(button.textContent));
        });
    }

    setupKeyboardInput() {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (/[\d\.\+\-\*\/\%]/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
                e.preventDefault();
                let input = key;
                if (key === 'Enter') input = '=';
                else if (key === 'Escape') input = 'AC';
                else if (key === '*') input = '×';
                else if (key === '/') input = '÷';
                else if (key === 'Backspace') input = 'DEL';
                this.handleInput(input);
            }
        });
    }

    setupThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        const htmlElement = document.documentElement;
        
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        htmlElement.setAttribute('data-theme', savedTheme);
        themeSwitch.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

        themeSwitch.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeSwitch.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
            
            this.playButtonSound();
        });
    }

    playButtonSound() {
        this.buttonSound.currentTime = 0;
        this.buttonSound.play().catch(error => {
            console.log('Audio playback failed:', error);
        });
    }

    handleInput(value) {
        this.playButtonSound();
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
            default:
                this.appendInput(value);
                break;
        }
    }

    updateDisplay() {
        this.displayExpression.textContent = this.expression || '0';
        this.displayResult.textContent = this.result || '';
    }

    clear() {
        this.expression = '';
        this.result = '';
        this.updateDisplay();
    }

    deleteLastChar() {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
    }

appendInput(value) {
    // Replace display symbols with calculation symbols
    const calculationValue = value
        .replace('×', '*')
        .replace('÷', '/');

    // Validate input
    const isOperator = /[\+\-\*\/\%]/.test(calculationValue);
    const isNumber = /[\d\.]/.test(calculationValue);

    if (isOperator && /[\+\-\*\/\%]$/.test(this.expression)) {
        this.expression = this.expression.slice(0, -1) + calculationValue;
    } else if (isNumber || (isOperator && this.expression !== '')) {
        this.expression += calculationValue;
    }

    this.updateDisplay();
}

calculate() {
    try {
        if (this.expression) {
            // Create a safe evaluation function
            const sanitizedExpression = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/');
            
            // Use Function instead of eval for better security
            const result = new Function('return ' + sanitizedExpression)();
            
            // Format the result
            this.result = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
            this.expression = this.result.toString();
            this.updateDisplay();
        }
    } catch (error) {
        this.result = 'Error';
        this.updateDisplay();
        setTimeout(() => this.clear(), 1500);
    }
}
}

// Initialize calculator
const calculator = new Calculator();