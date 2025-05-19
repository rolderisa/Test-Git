
import React from 'react';

const SwaggerUI = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-brand-600 text-white p-4">
        <h1 className="text-xl font-bold">Binary Supermarket API Documentation</h1>
        <p>Use this Swagger UI to test the API endpoints for the Binary Supermarket system</p>
      </div>
      <div className="flex-grow">
        <iframe 
          src="https://petstore.swagger.io/?url=https://gist.githubusercontent.com/anonymous/a90c48b437fb7fdb3fe645899ab25283/raw/aa8e5b44f7c35132f7d30ff7496d7f55c4c3e7df/binary_supermarket.yaml" 
          className="w-full h-full border-0"
          title="Swagger UI"
        />
      </div>
    </div>
  );
};

export default SwaggerUI;
