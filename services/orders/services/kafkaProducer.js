const { producer, topics } = require('../config/kafka');

// Simple function to publish order events
const publishOrderEvent = async (order) => {
  try {
    await producer.connect();
    
    // Publish order created event
    await producer.send({
      topic: topics.ORDER_CREATED,
      messages: [
        {
          key: order._id.toString(),
          value: JSON.stringify({
            orderId: order._id,
            userId: order.userId,
            items: order.items,
            status: order.status
          })
        }
      ]
    });

  } catch (error) {
    console.error('Error publishing order event:', error);
  } finally {
    await producer.disconnect();
  }
};

module.exports = {
  publishOrderEvent
};
