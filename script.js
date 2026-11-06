// 1. Grab the elements from the page
const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");
const buttons = document.querySelector(".buttons");

// 2. Variables that remember the calculator's state
let current = "0";          // number being typed / shown
let previous = "";          // first number (before pressing +, -, etc.)
let operator = null;        // the chosen operator
let waitingForSecond = false; // true right after pressing an operator
let justCalculated = false;   // true right after pressing =

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// 3. Update what the user sees
function updateDisplay() {
  resultEl.textContent = current;
  historyEl.textContent = operator ? `${previous} ${symbols[operator]}` : "";
}

// 4. Typing a digit or a decimal point
function appendNumber(digit) {
  if (waitingForSecond || justCalculated) {
    current = "0";
    waitingForSecond = false;
    justCalculated = false;
  }
  if (digit === ".") {
    if (current.includes(".")) return;   // only one dot allowed
    current += ".";
  } else if (current === "0") {
    current = digit;                     // replace the starting 0
  } else {
    if (current.length >= 12) return;    // limit the length
    current += digit;
  }
  updateDisplay();
}

// 5. Choosing + - × ÷
function chooseOperator(op) {
  if (operator !== null && !waitingForSecond) {
    compute();                           // allows 2 + 3 + 4 chains
  }
  previous = current;
  operator = op;
  waitingForSecond = true;
  justCalculated = false;
  updateDisplay();
}

// 6. The actual maths
function compute() {
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let answer;

  switch (operator) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    case "*": answer = a * b; break;
    case "/":
      if (b === 0) {
        clearAll();
        updateDisplay();
        historyEl.textContent = "Cannot divide by zero";
        return;
      }
      answer = a / b;
      break;
  }
  // toFixed fixes problems like 0.1 + 0.2 = 0.30000000000000004
  current = String(parseFloat(answer.toFixed(10)));
}

// 7. Pressing =
function equals() {
  if (operator === null || waitingForSecond) return;
  compute();
  operator = null;
  previous = "";
  justCalculated = true;
  updateDisplay();
}

// 8. Clear, delete, percent
function clearAll() {
  current = "0";
  previous = "";
  operator = null;
  waitingForSecond = false;
  justCalculated = false;
}

function deleteLast() {
  if (waitingForSecond || justCalculated) return;
  current = current.slice(0, -1);
  if (current === "" || current === "-") current = "0";
  updateDisplay();
}

function percent() {
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

// 9. Mouse clicks: one listener handles ALL buttons
buttons.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.number !== undefined) appendNumber(btn.dataset.number);
  else if (btn.dataset.operator) chooseOperator(btn.dataset.operator);
  else if (btn.dataset.action === "equals") equals();
  else if (btn.dataset.action === "clear") { clearAll(); updateDisplay(); }
  else if (btn.dataset.action === "delete") deleteLast();
  else if (btn.dataset.action === "percent") percent();
});

// 10. Keyboard support (bonus task)
document.addEventListener("keydown", (e) => {
  if ("0123456789.".includes(e.key)) appendNumber(e.key);
  else if ("+-*/".includes(e.key)) chooseOperator(e.key);
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
  else if (e.key === "Backspace") deleteLast();
  else if (e.key === "Escape") { clearAll(); updateDisplay(); }
  else if (e.key === "%") percent();
});