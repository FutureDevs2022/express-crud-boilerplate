const socketio = require("socket.io");
const _ = require("lodash");
const { EventEmitter } = require("../../controllers/factory/operations");
const { LiveChatSocket } = require("./LiveChatSocket");

module.exports.Sockets = class {
    constructor(server) {
        this.io = socketio(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        global.io = this.io;
        this.listen = this.listen.bind(this);
        this.handleEvent = this.handleEvent.bind(this);

        EventEmitter.subscribe("server-event", (v) => this.handleEvent(v));
    }

    listen() {
        console.log("--io-- Socket.io Listening for events");
        /** @INFO Listen for new socket connection */
        this.io.on("connection", (socket) => {
            console.log("--io-- New Connection Detected");
            //   acknowledge to the client
            socket.emit("connected");

            // add client to socket global channel list
            const liveChatSocket = new LiveChatSocket(socket, this.io)
            liveChatSocket.listen()
            /* ADD MORE EVENTS HERE */

        });
    }


    handleEvent = ({ event, data }) => {
        console.log("*** RECEIVED SERVER EVENT ***", event)
        switch (event) {
            case "send-notification":
                console.log("-> Emitting Notification", data)
                this.io.emit(`notification-${data.receiver}`, data)
                break;

            default:
                break;
        }
    }
};
