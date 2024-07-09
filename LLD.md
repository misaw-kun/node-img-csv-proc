# Low level Design Doc

## Components

1. **Image Processing Service (Worker) Interaction:**

   - **Function**: Listens for jobs enqueued in BullMQ and does the processing -> upload -> callback to webhook.
   - **Role**: Handles the uploading of processed images (from sharp) to Cloudinary and retrieves the processed image URLs.

2. **Job Queue**

   - **Function** When an image URL is recieved from the upload API, it gets enqueued into the job queue (BullMQ in this case).
   - **Role**: The queue manages the timing and order of job execution, allowing for asynchronous processing.

3. **Webhook Handling:**

   - **Function**: Processes callbacks from the image processing service once processing of a batch is complete.
   - **Role**: Updates the database with the processed image URLs and marks the request as completed.

4. **Database Interaction:**

   - **Function**: Stores and tracks the status of each processing request and products.
   - **Role**: Handles CRUD operations for requests and products in the MongoDB database.

## Database Schema

### Collections

**Requests**:

<u>Fields:</u>

- request_id (String, Primary Key)
- status (String, e.g., "pending", "completed")
- created_at (Date)
- updated_at (Date)

**Products**:

<u>Fields:</u>

- product_id (String, Primary Key)
- request_id (String, Foreign Key (or reference Id) to requests)
- product_name (String)
- input_image_url (String)
- output_image_url (String)
- created_at (Date)
- updated_at (Date)

## API Docs

[Import this in Postman](/postman/node-img-csv-proc.postman_collection.json)

## High Level Visual Representation

![hld](./image-csv-proc-HLD.drawio.svg)
