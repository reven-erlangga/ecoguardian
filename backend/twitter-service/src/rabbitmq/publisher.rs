use lapin::{
    options::{BasicPublishOptions, ExchangeDeclareOptions},
    types::FieldTable,
    BasicProperties, Channel, Connection, ConnectionProperties,
};

/// Connect to RabbitMQ, create a channel, and declare the `ecoguard.events` topic exchange.
pub async fn connect(uri: &str) -> Result<Channel, Box<dyn std::error::Error>> {
    let conn = Connection::connect(uri, ConnectionProperties::default()).await?;
    let channel = conn.create_channel().await?;

    channel
        .exchange_declare(
            "ecoguard.events",
            lapin::ExchangeKind::Topic,
            ExchangeDeclareOptions {
                durable: true,
                ..Default::default()
            },
            FieldTable::default(),
        )
        .await?;

    println!("✅ Connected to RabbitMQ, exchange ecoguard.events ready");
    Ok(channel)
}

/// Publish a JSON payload to the `tweet.ingested` routing key.
pub async fn publish_tweet_ingested(
    channel: &Channel,
    payload: &[u8],
) -> Result<(), Box<dyn std::error::Error>> {
    channel
        .basic_publish(
            "ecoguard.events",
            "tweet.ingested",
            BasicPublishOptions::default(),
            payload,
            BasicProperties::default(),
        )
        .await?;
    Ok(())
}
