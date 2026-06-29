import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # The JWTAuthMiddlewareStack should have populated scope["user"]
        self.user = self.scope.get("user")
        
        if self.user and self.user.is_authenticated:
            # Create a group based on the user's ID to send them targeted notifications
            self.group_name = f"user_{self.user.id}_notifications"
            
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
            
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'You are now connected to the notifications channel.'
            }))
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # Receive message from room group
    async def notification_message(self, event):
        message = event['message']
        title = event.get('title', 'New Notification')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'title': title,
            'message': message
        }))
