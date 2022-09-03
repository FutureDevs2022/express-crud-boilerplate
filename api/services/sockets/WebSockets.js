module.exports.WebSockets = class {
    constructor() {
        this.users = [];
        this.connection = this.connection.bind(this);
        this.payload = {};
        this.active = true
    }

    connection(client) {
        // event fired when the chat room is disconnected
        client.on("disconnect", () => {
            console.log("USER DISCONNECTED =>", client.id)
            this.active = false;
            this.users = this.users.filter((user) => user.socketId !== client.id);
        });
        // add identity of user mapped to the socket id
        client.on("identity", (userId, callback) => {
            this.users.push({
                socketId: client.id,
                userId: userId,
            });
            if (callback) callback(this.users)
        });
        // subscribe person to chat & other user as well
        client.on("subscribe", (payload, otherUserId = "") => {
            if (payload) {
                const { liveStream, user, deviceId } = payload;
                if (liveStream) {
                    this.subscribeOtherUser(liveStream._id, otherUserId);
                    this.active = true;
                    const data = {
                        stream: liveStream._id,
                        user,
                        deviceId,
                        client: client.id,
                        active: true
                    }
                    this.payload = data
                    client.join(liveStream._id);
                    // save client as a viewer
                }
            }
        });
        // mute a chat room
        client.on("unsubscribe", (room) => {
            client.leave(room);
            this.active = false;
        });
    }

    subscribeOtherUser(room, otherUserId) {
        const userSockets = this.users.filter(
            (user) => user.userId === otherUserId
        );
        userSockets.map((userInfo) => {
            const socketConn = global.io.sockets.connected(userInfo.socketId);
            if (socketConn) {
                socketConn.join(room);
            }
        });
    }
}  