const socket = io();

const roomsListEl = document.getElementById('roomsList');
const newRoomInput = document.getElementById('newRoomInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const refreshRoomsBtn = document.getElementById('refreshRoomsBtn');
const currentRoomLabel = document.getElementById('currentRoomLabel');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const leaveBtn = document.getElementById('leaveBtn');
const nickInput = document.getElementById('nickInput');

let currentRoom = null;

function logSystem(text) {
  const li = document.createElement('li');
  li.className = 'system';
  li.textContent = text;
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addMessage({ nick, text, time }) {
  const li = document.createElement('li');
  li.className =
    nick === (nickInput.value || '').slice(0, 100) || nick === socket.id.slice(0, 6)
      ? 'me'
      : 'other';
  li.innerHTML = `<strong>${nick}</strong> <small style="color:#666">[${time}]</small><div>${text}</div>`;
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function fetchRooms() {
  try {
    const res = await fetch('/rooms');
    const json = await res.json();
    renderRooms(json.rooms || []);
  } catch (err) {
    console.error('erro ao pegar salas', err);
  }
}

function renderRooms(rooms) {
  roomsListEl.innerHTML = '';
  if (!rooms.length) {
    roomsListEl.innerHTML = '<div style="color:#666">Nenhuma sala criada ainda.</div>';
    return;
  }
  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room' + (room === currentRoom ? ' current' : '');
    div.innerHTML = `<span>${room}</span><button data-room="${room}">Entrar</button>`;
    roomsListEl.appendChild(div);
    div.querySelector('button').addEventListener('click', () => joinRoom(room));
  });
}

async function joinRoom(room) {
  if (currentRoom === room) return;
  if (currentRoom) {
    await new Promise(resolve => {
      socket.emit('leave_room', currentRoom, resp => {
        logSystem(`Saiu de ${currentRoom}`);
        resolve(resp);
      });
    });
  }

  socket.emit('join_room', room, resp => {
    if (resp && resp.ok) {
      currentRoom = room;
      currentRoomLabel.textContent = `Sala: ${room}`;
      messagesEl.innerHTML = '';
      logSystem(`Entrou na sala ${room}`);
      fetchRooms();
    } else {
      logSystem('Erro ao entrar na sala');
    }
  });
}

createRoomBtn.addEventListener('click', () => {
  const room = newRoomInput.value.trim();
  if (!room) return;
  joinRoom(room);
  newRoomInput.value = '';
});

refreshRoomsBtn.addEventListener('click', fetchRooms);

leaveBtn.addEventListener('click', () => {
  if (!currentRoom) return;
  socket.emit('leave_room', currentRoom, resp => {
    logSystem(`Saindo de ${currentRoom}`);
    currentRoom = null;
    currentRoomLabel.textContent = 'Nenhuma sala selecionada';
    messagesEl.innerHTML = '';
    fetchRooms();
  });
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  if (!currentRoom) {
    logSystem('Entre em uma sala antes de enviar mensagens.');
    return;
  }
  const nick = nickInput.value.trim() || socket.id.slice(0, 6);
  socket.emit('message', { room: currentRoom, text, nick }, ack => {
    if (!ack?.ok) {
      logSystem('Erro ao enviar: ' + (ack?.error || 'desconhecido'));
    }
  });
  messageInput.value = '';
}

socket.on('message', payload => addMessage(payload));
socket.on('system', payload => logSystem(`${payload.time} — ${payload.text}`));

fetchRooms();