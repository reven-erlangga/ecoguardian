#[derive(Debug, Clone)]
pub struct Config {
    pub grpc_port: u16,
    pub http_port: u16,
    pub mongo_uri: String,
    pub rabbitmq_uri: String,
    pub class_grpc_addr: String,
    pub nlp_grpc_addr: String,
    pub blockchain_grpc_addr: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            grpc_port: env_u16("GRPC_PORT", 50052),
            http_port: env_u16("HTTP_PORT", 8000),
            mongo_uri: std::env::var("MONGO_URI")
                .unwrap_or_else(|_| "mongodb://localhost:27017".to_string()),
            rabbitmq_uri: std::env::var("RABBITMQ_URI")
                .unwrap_or_else(|_| "amqp://guest:guest@localhost:5672".to_string()),
            class_grpc_addr: std::env::var("CLASSIFICATION_GRPC_ADDR")
                .unwrap_or_else(|_| "http://localhost:50053".to_string()),
            nlp_grpc_addr: std::env::var("NLP_GRPC_ADDR")
                .unwrap_or_else(|_| "http://localhost:50055".to_string()),
            blockchain_grpc_addr: std::env::var("BLOCKCHAIN_GRPC_ADDR")
                .unwrap_or_else(|_| "http://localhost:50056".to_string()),
        }
    }
}

fn env_u16(key: &str, default: u16) -> u16 {
    std::env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_env_u16_default() {
        // Non-existent env var returns the default
        assert_eq!(env_u16("NONEXISTENT_VAR_FOR_TEST_1", 8080), 8080);
    }

    #[test]
    fn test_env_u16_parse() {
        std::env::set_var("ENV_U16_PARSE_TEST", "9090");
        assert_eq!(env_u16("ENV_U16_PARSE_TEST", 8080), 9090);
        std::env::remove_var("ENV_U16_PARSE_TEST");
    }

    #[test]
    fn test_env_u16_invalid() {
        // Non-numeric string falls back to default
        std::env::set_var("ENV_U16_INVALID_TEST", "not-a-number");
        assert_eq!(env_u16("ENV_U16_INVALID_TEST", 8080), 8080);
        std::env::remove_var("ENV_U16_INVALID_TEST");
    }

    #[test]
    fn test_env_u16_negative() {
        // Negative number fails to parse as u16, falls back to default
        std::env::set_var("ENV_U16_NEG_TEST", "-1");
        assert_eq!(env_u16("ENV_U16_NEG_TEST", 3000), 3000);
        std::env::remove_var("ENV_U16_NEG_TEST");
    }

    #[test]
    fn test_env_u16_too_large() {
        // Number exceeding u16::MAX fails to parse, falls back to default
        std::env::set_var("ENV_U16_LARGE_TEST", "99999");
        assert_eq!(env_u16("ENV_U16_LARGE_TEST", 4000), 4000);
        std::env::remove_var("ENV_U16_LARGE_TEST");
    }

    #[test]
    fn test_config_defaults() {
        // All defaults when no env vars override
        let config = Config::from_env();
        assert_eq!(config.grpc_port, 50052);
        assert_eq!(config.http_port, 8000);
        assert_eq!(config.mongo_uri, "mongodb://localhost:27017");
        assert_eq!(config.rabbitmq_uri, "amqp://guest:guest@localhost:5672");
        assert_eq!(config.class_grpc_addr, "http://localhost:50053");
        assert_eq!(config.nlp_grpc_addr, "http://localhost:50055");
        assert_eq!(config.blockchain_grpc_addr, "http://localhost:50056");
    }

    #[test]
    fn test_config_custom_port() {
        std::env::set_var("GRPC_PORT", "50099");
        let config = Config::from_env();
        assert_eq!(config.grpc_port, 50099);
        std::env::remove_var("GRPC_PORT");
    }

    #[test]
    fn test_config_custom_http_port() {
        std::env::set_var("HTTP_PORT", "9999");
        let config = Config::from_env();
        assert_eq!(config.http_port, 9999);
        std::env::remove_var("HTTP_PORT");
    }

    #[test]
    fn test_config_custom_uris() {
        std::env::set_var("MONGO_URI", "mongodb://custom:27017");
        std::env::set_var("RABBITMQ_URI", "amqp://custom:5672");
        std::env::set_var("NLP_GRPC_ADDR", "http://custom:50055");
        std::env::set_var("CLASSIFICATION_GRPC_ADDR", "http://custom:50053");
        std::env::set_var("BLOCKCHAIN_GRPC_ADDR", "http://custom:50056");

        let config = Config::from_env();
        assert_eq!(config.mongo_uri, "mongodb://custom:27017");
        assert_eq!(config.rabbitmq_uri, "amqp://custom:5672");
        assert_eq!(config.class_grpc_addr, "http://custom:50053");
        assert_eq!(config.nlp_grpc_addr, "http://custom:50055");
        assert_eq!(config.blockchain_grpc_addr, "http://custom:50056");

        std::env::remove_var("MONGO_URI");
        std::env::remove_var("RABBITMQ_URI");
        std::env::remove_var("CLASSIFICATION_GRPC_ADDR");
        std::env::remove_var("BLOCKCHAIN_GRPC_ADDR");
        std::env::remove_var("NLP_GRPC_ADDR");
    }
}
