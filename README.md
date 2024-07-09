# Async Image Processing API w/ Workers

This API allows users to upload CSV files with image URLs, processes the images, and generates an output CSV file with the processed URLs.

## Features

- Upload CSV with image URLs
- Image processing (resizing, etc.)
- Webhook notification on completion
- Generate output CSV with processed URLs

## Technology Stack

- Node.js, Express.js - API Server
- BullMQ, Redis - Job Queue
- Cloudinary, MongoDB - Asset storage & CSV Data
- PM2, AWS Lightsail - Process Management & Hosting

# Setup Instructions

1. Clone the Repository:

```sh
git clone https://github.com/misaw-kun/node-img-csv-proc.git
cd node-img-csv-proc
```

2. Install Dependencies:

```sh
Copy code
npm install
```

3. Environment Variables:
   Create a .env file from the `.env.example` file.

4. Start the Server:

```sh
Copy code
npm start
```

5. Start the Worker:

```sh
Copy code
npm run start:worker
```

## Postman Collection

Import the collection file from the `postman` directory for testing.

## Usage

Refer the postman documentation for usage.
