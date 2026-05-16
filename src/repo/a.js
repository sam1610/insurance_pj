// you are an AWS iot exprt, write a program in nodejs that  simulates a device that connects to AWS IoT and publishes a message to a topic every 5 seconds.

const iotData = new AWS.IotData({ endpoint: 'a3l9efh9x9pqsn-ats.iot.us-east-1.amazonaws.com' });

function publishMessage(topic, message) {
    const params = {
        topic: topic,
        payload: JSON.stringify(message),
        qos: 0
    };
    iotData.publish(params, (err, data) => {
        if (err) {
            console.log('Error publishing message:', err);
        } else {
            console.log('Message published successfully:', data);
        }
    });
}

// Simulate device behavior
setInterval(() => {
    const message = {
        timestamp: new Date().toISOString(),
        temperature: Math.random() * 100,
        humidity: Math.random() * 100
    };
    publishMessage('device/sensor/data', message);
}, 5000);