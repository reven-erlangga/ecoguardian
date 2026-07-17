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
                "value": "User"
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
                "value": "user-auth-service:50051"
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
                                "value": "{\"nested\":{\"user\":{\"options\":{\"go_package\":\"github.com/ecoguard/protobuf/user\"},\"nested\":{\"UserService\":{\"methods\":{\"Register\":{\"requestType\":\"RegisterRequest\",\"responseType\":\"RegisterResponse\",\"comment\":null},\"Login\":{\"requestType\":\"LoginRequest\",\"responseType\":\"LoginResponse\",\"comment\":null},\"GetUser\":{\"requestType\":\"GetUserRequest\",\"responseType\":\"User\",\"comment\":null},\"UpdateUser\":{\"requestType\":\"UpdateUserRequest\",\"responseType\":\"User\",\"comment\":null}},\"comment\":null},\"AuthService\":{\"methods\":{\"ValidateToken\":{\"requestType\":\"ValidateTokenRequest\",\"responseType\":\"ValidateTokenResponse\",\"comment\":null},\"RefreshToken\":{\"requestType\":\"RefreshTokenRequest\",\"responseType\":\"RefreshTokenResponse\",\"comment\":null}},\"comment\":null},\"ValidateTokenRequest\":{\"fields\":{\"token\":{\"type\":\"string\",\"id\":1,\"comment\":null}},\"comment\":null},\"ValidateTokenResponse\":{\"fields\":{\"user_id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"role\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null},\"RefreshTokenRequest\":{\"fields\":{\"token\":{\"type\":\"string\",\"id\":1,\"comment\":null}},\"comment\":null},\"RefreshTokenResponse\":{\"fields\":{\"token\":{\"type\":\"string\",\"id\":1,\"comment\":null}},\"comment\":null},\"User\":{\"fields\":{\"id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"email\":{\"type\":\"string\",\"id\":2,\"comment\":null},\"username\":{\"type\":\"string\",\"id\":3,\"comment\":null},\"role\":{\"type\":\"string\",\"id\":4,\"comment\":null},\"created_at\":{\"type\":\"common.Timestamp\",\"id\":5,\"comment\":null},\"updated_at\":{\"type\":\"common.Timestamp\",\"id\":6,\"comment\":null}},\"comment\":null},\"RegisterRequest\":{\"fields\":{\"email\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"username\":{\"type\":\"string\",\"id\":2,\"comment\":null},\"password\":{\"type\":\"string\",\"id\":3,\"comment\":null}},\"comment\":null},\"RegisterResponse\":{\"fields\":{\"user\":{\"type\":\"User\",\"id\":1,\"comment\":null},\"token\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null},\"LoginRequest\":{\"fields\":{\"email\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"password\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null},\"LoginResponse\":{\"fields\":{\"user\":{\"type\":\"User\",\"id\":1,\"comment\":null},\"token\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null},\"GetUserRequest\":{\"fields\":{\"id\":{\"type\":\"string\",\"id\":1,\"comment\":null}},\"comment\":null},\"UpdateUserRequest\":{\"fields\":{\"id\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"email\":{\"type\":\"string\",\"id\":2,\"comment\":null},\"username\":{\"type\":\"string\",\"id\":3,\"comment\":null}},\"comment\":null}}},\"common\":{\"options\":{\"go_package\":\"github.com/ecoguard/protobuf/common\"},\"nested\":{\"Timestamp\":{\"fields\":{\"seconds\":{\"type\":\"int64\",\"id\":1,\"comment\":null},\"nanos\":{\"type\":\"int32\",\"id\":2,\"comment\":null}},\"comment\":null},\"Pagination\":{\"fields\":{\"page\":{\"type\":\"int32\",\"id\":1,\"comment\":null},\"per_page\":{\"type\":\"int32\",\"id\":2,\"comment\":null}},\"comment\":null},\"PaginationResponse\":{\"fields\":{\"page\":{\"type\":\"int32\",\"id\":1,\"comment\":null},\"per_page\":{\"type\":\"int32\",\"id\":2,\"comment\":null},\"total\":{\"type\":\"int32\",\"id\":3,\"comment\":null}},\"comment\":null},\"Empty\":{\"fields\":{},\"comment\":null},\"Error\":{\"fields\":{\"code\":{\"type\":\"string\",\"id\":1,\"comment\":null},\"message\":{\"type\":\"string\",\"id\":2,\"comment\":null}},\"comment\":null}}}}}"
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
            "value": "user_UserService_GetUser"
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
                  "value": "user__GetUserRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__User"
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
                    "value": "User"
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
                    "value": "user.UserService"
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
                    "value": "GetUser"
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
            "value": "user_UserService_connectivityState"
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
                    "value": "User"
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
                    "value": "user.UserService"
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
            "value": "user_AuthService_connectivityState"
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
                    "value": "User"
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
                    "value": "user.AuthService"
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
        "value": "user__User"
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
            "value": "email"
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
            "value": "username"
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
            "value": "role"
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
            "value": "updated_at"
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
      "kind": "InputObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "user__GetUserRequest_Input"
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
            "value": "user_UserService_Register"
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
                  "value": "user__RegisterRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__RegisterResponse"
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
                    "value": "User"
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
                    "value": "user.UserService"
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
                    "value": "Register"
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
            "value": "user_UserService_Login"
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
                  "value": "user__LoginRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__LoginResponse"
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
                    "value": "User"
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
                    "value": "user.UserService"
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
                    "value": "Login"
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
            "value": "user_UserService_UpdateUser"
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
                  "value": "user__UpdateUserRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__User"
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
                    "value": "User"
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
                    "value": "user.UserService"
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
                    "value": "UpdateUser"
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
            "value": "user_AuthService_ValidateToken"
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
                  "value": "user__ValidateTokenRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__ValidateTokenResponse"
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
                    "value": "User"
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
                    "value": "user.AuthService"
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
                    "value": "ValidateToken"
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
            "value": "user_AuthService_RefreshToken"
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
                  "value": "user__RefreshTokenRequest_Input"
                }
              },
              "directives": []
            }
          ],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__RefreshTokenResponse"
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
                    "value": "User"
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
                    "value": "user.AuthService"
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
                    "value": "RefreshToken"
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
        "value": "user__RegisterResponse"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "user"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__User"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "token"
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
        "value": "user__RegisterRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "email"
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
            "value": "username"
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
            "value": "password"
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
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "user__LoginResponse"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "user"
          },
          "arguments": [],
          "type": {
            "kind": "NamedType",
            "name": {
              "kind": "Name",
              "value": "user__User"
            }
          },
          "directives": []
        },
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "token"
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
        "value": "user__LoginRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "email"
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
            "value": "password"
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
      "kind": "InputObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "user__UpdateUserRequest_Input"
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
            "value": "email"
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
            "value": "username"
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
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "user__ValidateTokenResponse"
      },
      "fields": [
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
            "value": "role"
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
        "value": "user__ValidateTokenRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "token"
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
      "kind": "ObjectTypeDefinition",
      "name": {
        "kind": "Name",
        "value": "user__RefreshTokenResponse"
      },
      "fields": [
        {
          "kind": "FieldDefinition",
          "name": {
            "kind": "Name",
            "value": "token"
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
        "value": "user__RefreshTokenRequest_Input"
      },
      "fields": [
        {
          "kind": "InputValueDefinition",
          "name": {
            "kind": "Name",
            "value": "token"
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