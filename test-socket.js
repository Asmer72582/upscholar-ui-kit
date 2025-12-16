import io from 'socket.io-client';

const SOCKET_URL = 'https://upscholar-backend.onrender.com';

console.log('🧪 Testing Socket.io Connection...');
console.log(`📡 Connecting to: ${SOCKET_URL}`);

const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    forceNew: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
});

// Connection events
socket.on('connect', () => {
    console.log('✅ Successfully connected to backend!');
    console.log(`🔌 Socket ID: ${socket.id}`);

    // Test joining a meeting
    const testMeetingId = '692fa3c9c8538d7aaf91b71f';
    const testUser = {
        meetingId: testMeetingId,
        userId: 'test-user-123',
        userName: 'Test User',
        userRole: 'student'
    };

    console.log(`📋 Joining test meeting: ${testMeetingId}`);
    socket.emit('join-meeting', testUser);
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    console.error('Error details:', error);
});

socket.on('connect_timeout', () => {
    console.error('❌ Connection timeout after 10 seconds');
});

socket.on('disconnect', (reason) => {
    console.log(`🔌 Disconnected: ${reason}`);
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}`);
});

socket.on('reconnect_failed', () => {
    console.error('❌ Reconnection failed after all attempts');
});

// Meeting-specific events
socket.on('meeting-joined', (data) => {
    console.log('✅ Meeting joined successfully!');
    console.log(`👥 Participants: ${data.participants.length}`);
    console.log(`👑 Is host: ${data.isHost}`);
});

socket.on('user-joined', (data) => {
    console.log(`👤 User joined: ${data.userName} (${data.userRole})`);
});

socket.on('user-left', (data) => {
    console.log(`👋 User left: ${data.userName}`);
});

socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
});

// Auto-disconnect after 30 seconds
setTimeout(() => {
    if (socket.connected) {
        console.log('⏰ Disconnecting after 30 seconds...');
        socket.disconnect();
        process.exit(0);
    }
}, 30000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Gracefully shutting down...');
    socket.disconnect();
    process.exit(0);
});