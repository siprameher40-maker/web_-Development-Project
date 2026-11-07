const resultDisplay = document.querySelector("#result");
const expressionDisplay = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

let displayValue = "0";
let storedValue = null;
let pendingOperator = null;
let shouldStartNewNumber = false;
let expressionText = "";

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function render() {
  resultDisplay.textContent = displayValue;
  expressionDisplay.textContent = expressionText;
  keypad.querySelectorAll("[data-operator]").forEach((button) => {
    button.classList.toggle(
      "is-selected",
      button.dataset.operator === pendingOperator && shouldStartNewNumber,
    );
  });
}

function enterDigit(digit) {
  if (displayValue === "Error" || shouldStartNewNumber) {
    displayValue = digit;
    shouldStartNewNumber = false;
  } else if (displayValue === "0") {
    displayValue = digit;
  } else if (displayValue.replace("-", "").length < 15) {
    displayValue += digit;
  }
  render();
}

function enterDecimal() {
  if (displayValue === "Error" || shouldStartNewNumber) {
    displayValue = "0.";
    shouldStartNewNumber = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? NaN : left / right;
    default:
      return right;
  }
}

function chooseOperator(operator) {
  if (displayValue === "Error") clear();

  const currentValue = Number(displayValue);
  if (pendingOperator && !shouldStartNewNumber && storedValue !== null) {
    const intermediate = calculate(storedValue, currentValue, pendingOperator);
    displayValue = formatNumber(intermediate);
    storedValue = Number.isFinite(intermediate) ? intermediate : null;
  } else {
    storedValue = currentValue;
  }

  pendingOperator = operator;
  expressionText = `${displayValue} ${operatorSymbols[operator]}`;
  shouldStartNewNumber = true;
  render();
}

function calculateResult() {
  if (!pendingOperator || storedValue === null || displayValue === "Error") return;

  const left = storedValue;
  const right = Number(displayValue);
  const answer = calculate(left, right, pendingOperator);
  expressionText = `${formatNumber(left)} ${operatorSymbols[pendingOperator]} ${formatNumber(right)} =`;
  displayValue = formatNumber(answer);
  storedValue = null;
  pendingOperator = null;
  shouldStartNewNumber = true;
  render();
}

function clear() {
  displayValue = "0";
  storedValue = null;
  pendingOperator = null;
  shouldStartNewNumber = false;
  expressionText = "";
  render();
}

function deleteLastDigit() {
  if (displayValue === "Error" || shouldStartNewNumber) {
    displayValue = "0";
    shouldStartNewNumber = false;
  } else if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith("-"))) {
    displayValue = "0";
  } else {
    displayValue = displayValue.slice(0, -1);
  }
  render();
}

function changeSign() {
  if (displayValue === "Error") return;
  displayValue = formatNumber(Number(displayValue) * -1);
  render();
}

function convertToPercent() {
  if (displayValue === "Error") return;
  displayValue = formatNumber(Number(displayValue) / 100);
  render();
}

function handleAction(action) {
  switch (action) {
    case "clear":
      clear();
      break;
    case "delete":
      deleteLastDigit();
      break;
    case "decimal":
      enterDecimal();
      break;
    case "equals":
      calculateResult();
      break;
    case "sign":
      changeSign();
      break;
    case "percent":
      convertToPercent();
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) {
    enterDigit(button.dataset.digit);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else {
    handleAction(button.dataset.action);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) {
    enterDigit(event.key);
  } else if (event.key === ".") {
    enterDecimal();
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    chooseOperator(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (event.key === "Backspace") {
    deleteLastDigit();
  } else if (event.key === "Escape" || event.key.toLowerCase() === "c") {
    clear();
  } else if (event.key === "%") {
    convertToPercent();
  }
});

render();
