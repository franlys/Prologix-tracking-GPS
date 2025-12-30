import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL
    credentials: true,
  },
  namespace: '/positions',
})
export class PositionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PositionsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`❌ Client ${client.id} - No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(`❌ Client ${client.id} - Invalid token payload`);
        client.disconnect();
        return;
      }

      // Store user-socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      this.socketUsers.set(client.id, userId);

      // Join user-specific room
      client.join(`user:${userId}`);

      this.logger.log(
        `✅ Client ${client.id} connected (User: ${userId}) - Total users: ${this.userSockets.size}`,
      );

      // Send initial connection success
      client.emit('connected', {
        message: 'Connected to Prologix GPS real-time updates',
        userId,
      });
    } catch (error) {
      this.logger.error(
        `❌ Connection failed for client ${client.id}: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (userId) {
      // Remove socket from user's socket set
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);

        // If no more sockets for this user, remove the user entry
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }

      this.socketUsers.delete(client.id);

      this.logger.log(
        `🔌 Client ${client.id} disconnected (User: ${userId}) - Remaining users: ${this.userSockets.size}`,
      );
    }
  }

  /**
   * Subscribe to specific device updates
   */
  @SubscribeMessage('subscribe:device')
  handleDeviceSubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    client.join(`device:${data.deviceId}`);
    this.logger.log(
      `📡 User ${userId} subscribed to device ${data.deviceId}`,
    );

    client.emit('subscribed', {
      deviceId: data.deviceId,
      message: `Subscribed to device ${data.deviceId} updates`,
    });
  }

  /**
   * Unsubscribe from device updates
   */
  @SubscribeMessage('unsubscribe:device')
  handleDeviceUnsubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    client.leave(`device:${data.deviceId}`);
    this.logger.log(
      `🔕 User ${userId} unsubscribed from device ${data.deviceId}`,
    );
  }

  /**
   * Emit position update to specific user
   */
  emitPositionUpdate(userId: string, position: any) {
    this.server.to(`user:${userId}`).emit('position:update', position);
  }

  /**
   * Emit position update to device subscribers
   */
  emitDevicePosition(deviceId: string, position: any) {
    this.server.to(`device:${deviceId}`).emit('position:update', position);
  }

  /**
   * Emit batch position updates to user
   */
  emitBatchPositions(userId: string, positions: any[]) {
    this.server.to(`user:${userId}`).emit('positions:batch', positions);
  }

  /**
   * Emit device status update (online/offline)
   */
  emitDeviceStatus(deviceId: string, status: 'online' | 'offline') {
    this.server.to(`device:${deviceId}`).emit('device:status', {
      deviceId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event notification (geofence, speed alert, etc.)
   */
  emitEvent(userId: string, event: any) {
    this.server.to(`user:${userId}`).emit('event:notification', event);
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedUsers: this.userSockets.size,
      totalConnections: this.socketUsers.size,
      users: Array.from(this.userSockets.entries()).map(([userId, sockets]) => ({
        userId,
        connections: sockets.size,
      })),
    };
  }

  /**
   * Broadcast to all connected clients (admin only)
   */
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`📢 Broadcast: ${event} to all ${this.socketUsers.size} connections`);
  }
}
