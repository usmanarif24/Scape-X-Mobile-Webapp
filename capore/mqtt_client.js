class MqttClient {
    constructor(address, clientId) {
        this.on_message_dict = {};
        this.message_queue = [];
        this.subscription_queue = [];
        this.onConnectedCallbacks = [];
        this.onDisconnectedCallbacks = [];
        this.open = false;
        this.mqtt_client = new Paho.MQTT.Client(address, clientId);
        this.mqtt_client.onMessageArrived = (msg) => this.onMessageArrived(msg);
        this.mqtt_client.onConnected = (reconnect, host) => this.onConnected(reconnect, host);
        this.mqtt_client.onConnectionLost = (response) => {
            this.onConnectionLost(response);
        };
        this.mqtt_client.onMessageDelivered = (msg) => this.onMessageDelivered(msg);
        this.mqtt_client.connect();
        console.log("client connected " + this.mqtt_client.isConnected());
    }
    onConnected(reconnect, host) {
        console.log("mqtt client connected");
        this.triggerCallbacks(this.onConnectedCallbacks);
        this.open = true;
        let count = this.message_queue.length;
        for (let i = 0; i < count; i++) {
            let message = this.message_queue[i];
            this.mqtt_client.send(message.destinationName, message.payloadString, message.qos, message.retained);
        }
        for (let j = 0; j < this.subscription_queue.length; j++) {
            this.subscribe(this.subscription_queue[j], undefined);
        }
        this.message_queue = [];
        this.subscription_queue = [];
    }
    onMessageArrived(msg) {
        if (msg.destinationName in this.on_message_dict) {
            const on_message = this.on_message_dict[msg.destinationName];
            if (on_message != null) {
                on_message(msg.payloadString);
            }
            else {
                console.log(`received message ${msg}, but no handler`);
            }
        }
    }
    onConnectionLost(response) {
        if (response.errorCode !== 0) {
            console.log("onConnectionLost:" + response.errorMessage);
        }
        else {
            this.triggerCallbacks(this.onDisconnectedCallbacks);
            console.log("connection to mqtt server closed");
        }
    }
    registerOnConnected(callback) {
        this.onConnectedCallbacks.push(callback);
    }
    registerOnDisconnected(callback) {
        this.onDisconnectedCallbacks.push(callback);
    }
    subscribe(topic, on_message) {
        this.on_message_dict[topic] = on_message;
        if (this.open) {
            const subscribeOptions = {
                qos: 1,
                onSuccess: (invocationContext) => {
                    console.log(`subscribed to ${topic}`);
                },
                onFailure: (invocationContext, errorCode, errorMessage) => {
                    if (errorCode !== 0) {
                        console.log(`unable to subscribe to ${topic}: ${errorMessage}`);
                    }
                },
                timeout: 10
            };
            this.mqtt_client.subscribe(topic, subscribeOptions);
        }
        else {
            this.subscription_queue.push(topic);
        }
    }
    send(topic, message, qos, retained) {
        if (this.open) {
            this.mqtt_client.send("sxm/" + topic, message, qos, retained);
        }
        else {
            let mqtt_message = new Paho.MQTT.Message(message);
            mqtt_message.destinationName = topic;
            mqtt_message.qos = qos;
            mqtt_message.retained = retained;
            this.message_queue.push(mqtt_message);
        }
    }
    triggerCallbacks(callbacks) {
        let count = callbacks.length;
        for (let i = 0; i < count; i++) {
            callbacks[i]();
        }
    }
    onMessageDelivered(msg) {
    }
}
export { MqttClient };
