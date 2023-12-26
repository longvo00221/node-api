import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Documentation",
      version: "1.0.0",
      description: "API documentation for your application",
    },
   
    servers: [
      {
        url: "http://localhost:5000", // Update with your server URL
        description: "Development server",
      },
    ],
    paths: {
       
        '/api/products': {
          get: {
            description: 'Endpoint to get product data',
            responses: {
              '200': {
                description: 'Successfully retrieved product data',
              },
            },
          },
        },
        '/api/users': {
          get: {
            description: 'Endpoint to get user data',
            responses: {
              '200': {
                description: 'Successfully retrieved user data',
              },
            },
          },
        },
        '/api/orders': {
          get: {
            description: 'Endpoint to get order data',
            responses: {
              '200': {
                description: 'Successfully retrieved order data',
              },
            },
          },
        },
        '/api/momo': {
          get: {
            description: 'Endpoint to get momo data',
            responses: {
              '200': {
                description: 'Successfully retrieved momo data',
              },
            },
          },
        },
      },
  },
  apis: ["./Routes/ProductRoutes.js"], // Update with the path where your route files are located
};

const specs = swaggerJsdoc(options);

export default specs;
