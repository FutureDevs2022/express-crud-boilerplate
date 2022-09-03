const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { DatabaseStub } = require("../../controllers/factory/DatabaseStub");
const liveStream = require("../../models/liveStream");
const moment = require("moment");
const { EventEmitter, OTP_GEN } = require("../../controllers/factory/operations");
const Comment = require("../../models/comment");

module.exports.LiveChatSocket = class {
    constructor(socket, io) {
        try {
            this.io = io;
            this.socket = socket;
            this.clients = [];
            this.userData = (socket.handshake && socket.handshake.headers["authorization"])
                ? jwt.verify(
                    socket.handshake.headers["authorization"],
                    process.env.JWT_KEY
                )
                : null;
            // EventEmitter.subscribe("stream-event", (v) => this.handleEvent(v));

        } catch (error) {
            // socket.disconnect();
            console.log("Error encountered", error.message);
        }
    }

    listen() {
        try {
            /**@todo listens for client joining live stream chats */
            /** @expects data object containing properties form the channel model */
            this.socket.on("join", async (body, callback) => {
                try {
                    const ctx = this;
                    console.log("--io-- A new client is attempting to join the live stream");
                    if (body.channelId) {
                        // find the live stream with the channel id
                        const stub = new DatabaseStub(liveStream);
                        let streams = await stub.read({}, { channelId: body.channelId });
                        if (streams?.data?.length > 0) {
                            // append user id to body object
                            if (this.userData) Object.assign(body, { id: this.userData.id, joined: moment().format("DD-MM-YYYY hh:mm a") });
                            let liveStream = streams.data[0];
                            // check if the stream is live
                            if (!liveStream.isLive) throw Error("Unable to subscribe to live chat. Live Stream ended")
                            // check if the user has been added to the viewers list for the stream
                            const viewer = _.find(liveStream.viewers, function (entry) {
                                return entry.id === ctx.userData?.id;
                            })
                            if (!viewer && this.userData) {
                                // add user to viewers list ONLY if they're logged in
                                const viewers = _.concat(liveStream.viewers, body);
                                await stub.update(liveStream._id, { viewers });
                                // get the updated data
                                streams = await stub.read({}, { channelId: body.channelId });
                                liveStream = streams.data[0];
                            }
                            this.clients.push(body);
                            this.clients = _.uniqBy(this.clients, 'id');
                            console.log("--io-- Client Population --", _.size(this.clients));
                            if (callback) {
                                callback({
                                    liveStream,
                                    message: `Sucessfully subscribed to live stream chat with Channel Id: ${body.channelId}`
                                })
                            }
                        } else {
                            throw Error(`Unable to subscribe to live stream chat with Channel Id: ${body.channelId}`)
                        }
                    } else {
                        if (callback) {
                            throw Error(`Unable to subscribe to live stream chat with Channel Id: ${body.channelId}`)
                        }
                    }
                } catch (error) {
                    console.log("Error Encountered", error);
                    if (callback) {
                        callback({
                            message: error.message
                        })
                    }
                }
            });

            global.io.on("send-message", async (body) => {
                try {
                    console.log("SENDING...", body);
                    this.socket.emit(`live-chat-${body.channelId}`, body)

                    // EventEmitter.dispatch("stream-event", {
                    //     event: "live-chat",
                    //     data: {
                    //         ...body,
                    //         receiver: body.channelId,
                    //         sender: this.userData?.id || null,
                    //         msgId: `${OTP_GEN(4)}-${OTP_GEN(4)}`,
                    //         sentAt: moment().format("DD-MM-YYYY hh:mm a")
                    //     }
                    // })
                } catch (error) {
                    console.log("Error Encountered", error);
                    if (callback) {
                        callback({
                            message: error.message
                        })
                    }
                }
            })

        } catch (error) {
            console.log("Error encountered", error);
        }
    }


    handleEvent = async ({ event, data }) => {
        console.log("*** RECEIVED LIVE CHAT EVENT ***", event)
        switch (event) {
            case "live-chat":
                try {
                    console.log("-> Emitting Chat Message", data)
                    this.socket.emit(`live-chat-${data.receiver}`, data);
                    this.handleSaveComment(data)
                } catch (error) {
                    console.log(error.message);
                }
                break;

            default:
                break;
        }
    }

    handleSaveComment = _.debounce((data) => this.saveComment(data), 5000);

    saveComment = async (data) => {
        try {
            // create a comment entry for the stream
            const stub = new DatabaseStub(Comment);
            let res = await stub.create({
                entity: data.stream?._id,
                entityModel: "LiveStream",
                comment: data.message,
                commentId: data.msgId,
                user: data?.user?._id
            })
            console.log("SAVED COMMENT =>", res);

        } catch (error) {
            console.log("SAVE COMMENT ERROR =>",error.message)
        }
    }
};
