// @ts-nocheck
import { buildASTSchema } from 'graphql';

const schemaAST = {
  "kind": "Document",
  "definitions": [
    {
      "kind": "SchemaDefinition",
      "operationTypes": [
        {
          "kind": "OperationTypeDefinition",
          "operation": "query",
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Query"
            }
          }
        },
        {
          "kind": "OperationTypeDefinition",
          "operation": "mutation",
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Mutation"
            }
          }
        }
      ],
      "directives": [
        {
          "kind": "Directive",
          "name": {
            "kind": "Name",
            "value": "transport"
          },
          "arguments": [
            {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "subgraph"
              },
              "value": {
                "kind": "StringValue",
                "value": "Notification"
              }
            },
            {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "kind"
              },
              "value": {
                "kind": "StringValue",
                "value": "grpc"
              }
            },
            {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "location"
              },
              "value": {
                "kind": "StringValue",
                "value": "notification-service:50054"
              }
            },
            {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "options"
              },
              "value": {
                "kind": "ObjectValue",
                "fields": [
                  {
                    "kind": "ObjectField",
                    "name": {
                      "kind": "Name",
                      "value": "requestTimeout"
                    },
                    "value": {
                      "kind": "IntValue",
                      "value": "200000"
                    }
                  },
                  {
                    "kind": "ObjectField",
                    "name": {
                      "kind": "Name",
                      "value": "roots"
                    },
                    "value": {
                      "kind": "ListValue",
                      "values": [
                        {
                          "kind": "ObjectValue",
                          "fields": [
                            {
                              "kind": "ObjectField",
                              "name": {
                                "kind": "Name",
                                "value": "name"
                              },
                              "value": {
                                "kind": "StringValue",
                                "value": "Root0"
                              }
                            },
                            {
                              "kind": "ObjectField",
                              "name": {
                                "kind": "Name",
                                "value": "rootJson"
                              },
                              "value": {
                                "kind": "StringValue",
                                "value": "{\"nested\":{\"notification\":{\"options\":{\"go_package\":\"github.com/ecoguard/protobuf/notification\"},\"nested\":{\"NotificationService\":{\"methods\":{\"SendNotification\":{\"requestType\":\"SendNotificationRequest\",\"responseType\":\"SendNotificationResponse\",\"comment\":null},\"GetNotifications\":{\"requestType\":\"GetNotificationsRequest\",\"responseType\":\"GetNotificationsResponse\",\"comment\":null},\"MarkRead\":{\"requestType\":\"MarkReadRequest\",\"responseType\":\"common.Empty\",\"comment\":null}},\"comment\":null},\"Notification\":{\"fields\":{\"id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"user_id\":{\"type\":\"string\",\"id\":2,\"comment\":null},\"type\":{\"type\":\"string\",\"id\":3,\"comment\":null},\"channel\":{\"type\":\"string\",\"id\":4,\"comment\":null},\"title\":{\"type\":\"string\",\"id\":5,\"comment\":null},\"content\":{\"type\":\"string\",\"id\":6,\"comment\":null},\"status\":{\"type\":\"string\",\"id\":7,\"comment\":null},\"created_at\":{\"type\":\"common.Timestamp\",\"id\":8,\"comment\":null},\"read_at\":{\"type\":\"common.Timestamp\",\"id\":9,\"comment\":null}},\"comment\":null},\"SendNotificationRequest\":{\"fields\":{\"user_id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"type\":{\"type\":\"string\",\"id\":2,\"comment\":null},\"channel\":{\"type\":\"string\",\"id\":3,\"comment\":null},\"title\":{\"type\":\"string\",\"id\":4,\"comment\":null},\"content\":{\"type\":\"string\",\"id\":5,\"comment\":null}},\"comment\":null},\"SendNotificationResponse\":{\"fields\":{\"id\":{\"type\":\"string\",\"id\":1,\"comment\":null}},\"comment\":null},\"GetNotificationsRequest\":{\"fields\":{\"user_id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"status\":{\"type\":\"string\",\"id\":2,\"comment\":null},\"pagination\":{\"type\":\"common.Pagination\",\"id\":3,\"comment\":null}},\"comment\":null},\"GetNotificationsResponse\":{\"fields\":{\"notifications\":{\"rule\":\"repeated\",\"type\":\"Notification\",\"id\":1,\"comment\":null},\"pagination\":{\"type\":\"common.PaginationResponse\",\"id\":2,\"comment\":null}},\"comment\":null},\"MarkReadRequest\":{\"fields\":{\"id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"user_id\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null}}},\"common\":{\"options\":{\"go_package\":\"github.com/ecoguard/protobuf/common\"},\"nested\":{\"Timestamp\":{\"fields\":{\"seconds\":{\"type\":\"int64\",\"id\":1,\"comment\":null},\"nanos\":{\"type\":\"int32\",\"id\":2,\"comment\":null}},\"comment\":null},\"Pagination\":{\"fields\":{\"page\":{\"type\":\"int32\",\"id\":1,\"comment\":null},\"per_page\":{\"type\":\"int32\",\"id\":2,\"comment\":null}},\"comment\":null},\"PaginationResponse\":{\"fields\":{\"page\":{\"type\":\"int32\",\"id\":1,\"comment\":null},\"per_page\":{\"type\":\"int32\",\"id\":2,\"comment\":null},\"total\":{\"type\":\"int32\",\"id\":3,\"comment\":null}},\"comment\":null},\"Empty\":{\"fields\":{},\"comment\":null},\"Error\":{\"fields\":{\"code\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"message\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null}}}}}"
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "kind": "DirectiveDefinition",
      "name": {
        "kind": "Name",
        "value": "grpcMethod"
      },
      "arguments": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "subgraph"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "rootJsonName"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "objPath"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "methodName"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "responseStream"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Boolean"
            }
          },
          "directives": []
        }
      ],
      "repeatable": false,
      "locations": [
        {
          "kind": "Name",
          "value": "FIELD_DEFINITION"
        }
      ]
    },
    {
      "kind": "DirectiveDefinition",
      "name": {
        "kind": "Name",
        "value": "grpcConnectivityState"
      },
      "arguments": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "subgraph"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "rootJsonName"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "objPath"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        }
      ],
      "repeatable": false,
      "locations": [
        {
          "kind": "Name",
          "value": "FIELD_DEFINITION"
        }
      ]
    },
    {
      "kind": "DirectiveDefinition",
      "description": {
        "kind": "StringValue",
        "value": "Directs the executor to stream plural fields when the `if` argument is true or undefined.",
        "block": true
      },
      "name": {
        "kind": "Name",
        "value": "stream"
      },
      "arguments": [
        {
          "kind": "InputValueDefinition",
          "description": {
            "kind": "StringValue",
            "value": "Stream when true or undefined.",
            "block": true
          },
          "name": {
            "kind": "Name",
            "value": "if"
          },
          "type": {
            "kind": "NonNullType",
            "type": {
              "kind": "NamedType",
              "name": {
                "kind": "Name",
                "value": "Boolean"
              }
            }
          },
          "defaultValue": {
            "kind": "BooleanValue",
            "value": true
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "description": {
            "kind": "StringValue",
            "value": "Unique name",
            "block": true
          },
          "name": {
            "kind": "Name",
            "value": "label"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "description": {
            "kind": "StringValue",
            "value": "Number of items to return immediately",
            "block": true
          },
          "name": {
            "kind": "Name",
            "value": "initialCount"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "defaultValue": {
            "kind": "IntValue",
            "value": "0"
          },
          "directives": []
        }
      ],
      "repeatable": false,
      "locations": [
        {
          "kind": "Name",
          "value": "FIELD"
        }
      ]
    },
    {
      "kind": "DirectiveDefinition",
      "name": {
        "kind": "Name",
        "value": "transport"
      },
      "arguments": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "subgraph"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "kind"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "location"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "options"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "TransportOptions"
            }
          },
          "directives": []
        }
      ],
      "repeatable": true,
      "locations": [
        {
          "kind": "Name",
          "value": "SCHEMA"
        }
      ]
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "Query"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "notification_NotificationService_GetNotifications"
          },
          "arguments": [
            {
              "kind": "InputValueDefinition",
              "name": {
                "kind": "Name",
                "value": "input"
              },
              "type": {
                "kind": "NamedType",
                "name": {
                  "kind": "Name",
                  "value": "notification__GetNotificationsRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "notification__GetNotificationsResponse"
            }
          },
          "directives": [
            {
              "kind": "Directive",
              "name": {
                "kind": "Name",
                "value": "grpcMethod"
              },
              "arguments": [
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "subgraph"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Notification"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "rootJsonName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Root0"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "objPath"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "notification.NotificationService"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "methodName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "GetNotifications"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "responseStream"
                  },
                  "value": {
                    "kind": "BooleanValue",
                    "value": false
                  }
                }
              ]
            }
          ]
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "notification_NotificationService_connectivityState"
          },
          "arguments": [
            {
              "kind": "InputValueDefinition",
              "name": {
                "kind": "Name",
                "value": "tryToConnect"
              },
              "type": {
                "kind": "NamedType",
                "name": {
                  "kind": "Name",
                  "value": "Boolean"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "ConnectivityState"
            }
          },
          "directives": [
            {
              "kind": "Directive",
              "name": {
                "kind": "Name",
                "value": "grpcConnectivityState"
              },
              "arguments": [
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "subgraph"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Notification"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "rootJsonName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Root0"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "objPath"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "notification.NotificationService"
                  }
                }
              ]
            }
          ]
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "notification__GetNotificationsResponse"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "notifications"
          },
          "arguments": [],
          "type": {
            "kind": "ListType",
            "type": {
              "kind": "NamedType",
              "name": {
                "kind": "Name",
                "value": "notification__Notification"
              }
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "pagination"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "common__PaginationResponse"
            }
          },
          "directives": []
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "notification__Notification"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "id"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "user_id"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "type"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "channel"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "title"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "content"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "status"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "created_at"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "common__Timestamp"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "read_at"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "common__Timestamp"
            }
          },
          "directives": []
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "common__Timestamp"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "seconds"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "BigInt"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "nanos"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "directives": []
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "ScalarTypeDefinition",
      "description": {
        "kind": "StringValue",
        "value": "The `BigInt` scalar type represents non-fractional signed whole numeric values.",
        "block": true
      },
      "name": {
        "kind": "Name",
        "value": "BigInt"
      },
      "directives": []
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "common__PaginationResponse"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "page"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "per_page"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "total"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "directives": []
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "InputObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "notification__GetNotificationsRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "user_id"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "status"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "pagination"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "common__Pagination_Input"
            }
          },
          "directives": []
        }
      ],
      "directives": []
    },
    {
      "kind": "InputObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "common__Pagination_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "page"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "per_page"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "Int"
            }
          },
          "directives": []
        }
      ],
      "directives": []
    },
    {
      "kind": "EnumTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "ConnectivityState"
      },
      "values": [
        {
          "kind": "EnumValueDefinition",
          "name": {
            "kind": "Name",
            "value": "IDLE"
          },
          "directives": []
        },
        {
          "kind": "EnumValueDefinition",
          "name": {
            "kind": "Name",
            "value": "CONNECTING"
          },
          "directives": []
        },
        {
          "kind": "EnumValueDefinition",
          "name": {
            "kind": "Name",
            "value": "READY"
          },
          "directives": []
        },
        {
          "kind": "EnumValueDefinition",
          "name": {
            "kind": "Name",
            "value": "TRANSIENT_FAILURE"
          },
          "directives": []
        },
        {
          "kind": "EnumValueDefinition",
          "name": {
            "kind": "Name",
            "value": "SHUTDOWN"
          },
          "directives": []
        }
      ],
      "directives": []
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "Mutation"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "notification_NotificationService_SendNotification"
          },
          "arguments": [
            {
              "kind": "InputValueDefinition",
              "name": {
                "kind": "Name",
                "value": "input"
              },
              "type": {
                "kind": "NamedType",
                "name": {
                  "kind": "Name",
                  "value": "notification__SendNotificationRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "notification__SendNotificationResponse"
            }
          },
          "directives": [
            {
              "kind": "Directive",
              "name": {
                "kind": "Name",
                "value": "grpcMethod"
              },
              "arguments": [
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "subgraph"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Notification"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "rootJsonName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Root0"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "objPath"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "notification.NotificationService"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "methodName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "SendNotification"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "responseStream"
                  },
                  "value": {
                    "kind": "BooleanValue",
                    "value": false
                  }
                }
              ]
            }
          ]
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "notification_NotificationService_MarkRead"
          },
          "arguments": [
            {
              "kind": "InputValueDefinition",
              "name": {
                "kind": "Name",
                "value": "input"
              },
              "type": {
                "kind": "NamedType",
                "name": {
                  "kind": "Name",
                  "value": "notification__MarkReadRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "common__Empty"
            }
          },
          "directives": [
            {
              "kind": "Directive",
              "name": {
                "kind": "Name",
                "value": "grpcMethod"
              },
              "arguments": [
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "subgraph"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Notification"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "rootJsonName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "Root0"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "objPath"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "notification.NotificationService"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "methodName"
                  },
                  "value": {
                    "kind": "StringValue",
                    "value": "MarkRead"
                  }
                },
                {
                  "kind": "Argument",
                  "name": {
                    "kind": "Name",
                    "value": "responseStream"
                  },
                  "value": {
                    "kind": "BooleanValue",
                    "value": false
                  }
                }
              ]
            }
          ]
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "notification__SendNotificationResponse"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "id"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        }
      ],
      "interfaces": [],
      "directives": []
    },
    {
      "kind": "InputObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "notification__SendNotificationRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "user_id"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "type"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "channel"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "title"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "content"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        }
      ],
      "directives": []
    },
    {
      "kind": "ScalarTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "common__Empty"
      },
      "directives": [
        {
          "kind": "Directive",
          "name": {
            "kind": "Name",
            "value": "specifiedBy"
          },
          "arguments": [
            {
              "kind": "Argument",
              "name": {
                "kind": "Name",
                "value": "url"
              },
              "value": {
                "kind": "StringValue",
                "value": "http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf"
              }
            }
          ]
        }
      ]
    },
    {
      "kind": "InputObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "notification__MarkReadRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "id"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        },
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "user_id"
          },
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "String"
            }
          },
          "directives": []
        }
      ],
      "directives": []
    },
    {
      "kind": "ScalarTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "TransportOptions"
      },
      "directives": []
    }
  ]
};

export default buildASTSchema(schemaAST, {
  assumeValid: true,
  assumeValidSDL: true
});