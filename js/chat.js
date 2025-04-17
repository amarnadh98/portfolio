// Simple chat widget logic using classList.toggle() :contentReference[oaicite:16]{index=16}
const chat    = document.getElementById('chat');
const header  = chat.querySelector('.chat-header');
const msgs    = document.getElementById('messages');
const input   = document.getElementById('input');
const sendBtn = document.getElementById('send');

header.addEventListener('click', () => chat.classList.toggle('open'));

sendBtn.addEventListener('click', () => {
  const txt = input.value.trim();
  if (!txt) return;
  const userDiv = document.createElement('div');
  userDiv.textContent = txt;
  userDiv.style.textAlign = 'right';
  msgs.appendChild(userDiv);

  const botDiv = document.createElement('div');
  botDiv.textContent = "Hi there! I'm Aiko, your AI guide.";
  msgs.appendChild(botDiv);

  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';
});
