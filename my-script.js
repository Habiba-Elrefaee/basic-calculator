class Calculator {
    constructor() {
        this.expression = '';
        this.result = '';
        this.displayExpression = document.querySelector('.expression');
        this.displayResult = document.querySelector('.result');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => this.handleInput(button.textContent));
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
}