let noteCounter = 1;

function makeNotes() {
  const question = document.getElementById("textInput").value.trim();
  const answer = document.getElementById("resultText").textContent.trim(); // 👈 fixed here

  if (!question || !answer || answer === "Your answer will appear here..." || answer === "⏳ Thinking...") {
    alert("Please enter a question and generate an answer first.");
    return;
  }

  const notesList = document.getElementById("notesList");

  const noteItem = document.createElement("li");
  noteItem.innerHTML = `
    <strong>❓ Question ${noteCounter}:</strong> ${question}<br><br>
    <strong>✅ Answer:</strong>
    <div style="margin-top: 5px; white-space: pre-wrap; padding-left: 10px;">
      ${formatAnswerAsPoints(answer)}
    </div>
  `;

  notesList.appendChild(noteItem);
  noteCounter++;
}


function formatAnswerAsPoints(answer) {
  const lines = answer.split(/\n|(?<=\.) /g);
  return lines
    .filter(line => line.trim() !== "")
    .map((line, i) => `🔹 ${line.trim()}`)
    .join("<br>");
}
window.makeNotes = makeNotes;





particlesJS("particles-js", {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: { value: "#00b894" },
    shape: {
      type: "circle",
      stroke: { width: 0, color: "#000" },
    },
    opacity: {
      value: 0.3,
      random: true,
    },
    size: {
      value: 4,
      random: true,
    },
    line_linked: {
      enable: true,
      distance: 120,
      color: "#00b894",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
    },
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "grab" },
      onclick: { enable: true, mode: "push" },
    },
    modes: {
      grab: { distance: 150, line_linked: { opacity: 0.5 } },
      push: { particles_nb: 4 },
    },
  },
  retina_detect: true,
});

async function handleExplain() {
  const input = document.getElementById("textInput").value;
  const resultText = document.getElementById("resultText");

  resultText.textContent = "⏳ Thinking...";

  try {
    const response = await fetch("/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    const data = await response.json();

    if (data.result) {
      resultText.innerHTML = marked.parse(data.result); // ✅ Apply Markdown AFTER getting the result
    } else if (data.error) {
      resultText.textContent = `⚠️ Error: ${data.error}`;
    }
  } catch (error) {
    resultText.textContent = `⚠️ Request failed: ${error.message}`;
  }
}
async function generateQuiz() {
  const topic = document.getElementById("textInput").value.trim();
  const quizContainer = document.getElementById("quizContainer");

  if (!topic) {
    alert("Please enter a topic!");
    return;
  }

  quizContainer.innerHTML = "<p>Generating quiz...</p>";

  try {
    const response = await fetch("/generate_quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    const quiz = await response.json();

    if (quiz.error) {
      quizContainer.innerHTML = `<p>❌ Error: ${quiz.details}</p>`;
      return;
    }

    let html = "";

    quiz.forEach((q, index) => {
      html += `
        <div class="question-block">
          <h3>Q${index + 1}: ${q.question}</h3>
          <ul>
            ${q.options.map(option => `<li>${option}</li>`).join("")}
          </ul>
          <p><strong>Answer:</strong> ${q.answer}</p>
        </div>
        <hr>`;
    });

    quizContainer.innerHTML = html;

  } catch (err) {
    quizContainer.innerHTML = `<p>❌ Error: ${err.message}</p>`;
  }
}



function downloadPDF() {
  const notesElement = document.getElementById("notesList");

  if (!notesElement || !notesElement.innerHTML.trim()) {
    alert("There's nothing to download yet!");
    return;
  }

  const content = document.createElement("div");
  content.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center; color: #2c3e50;">📘 Learnova AI – Notes</h2>
      <p><strong>Question:</strong> ${document.getElementById("textInput").value}</p>
      <div style="margin-top: 15px;">
        ${notesElement.outerHTML}  <!-- Keeps structure intact -->
      </div>
    </div>
  `;

  const opt = {
    margin: 0.5,
    filename: 'Learnova_Notes.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().from(content).set(opt).save();
}









