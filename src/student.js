const form = document.getElementById("student-form");
form.addEventListener("submit", function (event) {
  event.preventDefault();

  checkCode(form.roomCode.value);
});

async function checkCode(code) {
  const url = "http://localhost:8787/api/validate";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (response.status === 200) {
    const data = await response.json();
    const token = data.token;
    const boardUrl = `http://localhost:5001/boards/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`;
    window.location.assign(boardUrl);
  } else {
    const errorMessage = document.getElementById("form-error");
    errorMessage.textContent = "Invalid Room Code.";
  }
}
