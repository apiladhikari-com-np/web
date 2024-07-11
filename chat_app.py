from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, join_room, leave_room, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

# Example storage for simplicity (replace with a proper storage mechanism)
rooms = {}

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    session['username'] = username
    return redirect(url_for('chat'))

@app.route('/chat')
def chat():
    if 'username' in session:
        return render_template('chat.html', username=session['username'])
    return redirect(url_for('home'))

@socketio.on('send_message')
def handle_send_message_event(data):
    room = data['room']
    emit('new_message', data, room=room)
    app.logger.info(f"{data['username']} has sent message to the room {data['room']}: {data['message']}")

@socketio.on('join')
def handle_join_room_event(data):
    username = data['username']
    room = data['room']
    join_room(room)
    if room not in rooms:
        rooms[room] = set()
    rooms[room].add(username)
    emit('join_announcement', {'room': room, 'users': list(rooms[room])}, room=room)
    app.logger.info(f"{username} has joined the room {room}")

@socketio.on('leave')
def handle_leave_room_event(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    if room in rooms and username in rooms[room]:
        rooms[room].remove(username)
        emit('leave_announcement', {'room': room, 'users': list(rooms[room])}, room=room)
        app.logger.info(f"{username} has left the room {room}")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=80, debug=True)
