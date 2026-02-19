import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export default (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email}`);
    
    socket.join(`user_${socket.user.id}`);
    socket.join(`role_${socket.user.role}`);

    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;
        
        const message = await db.Message.create({
          senderId: socket.user.id,
          receiverId,
          content
        });

        const fullMessage = await db.Message.findByPk(message.id, {
          include: [
            { model: db.User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role'] },
            { model: db.User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'role'] }
          ]
        });

        io.to(`user_${receiverId}`).emit('new_message', fullMessage);
        io.to(`user_${socket.user.id}`).emit('message_sent', fullMessage);
      } catch (error) {
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('join_conversation', (userId) => {
      socket.join(`conversation_${Math.min(socket.user.id, userId)}_${Math.max(socket.user.id, userId)}`);
    });

    socket.on('typing', (data) => {
      socket.to(`user_${data.receiverId}`).emit('user_typing', {
        senderId: socket.user.id,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });

  return io;
};
