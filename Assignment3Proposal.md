# Assignment 3 Project Proposal

The working application idea for assignment 3 is a blogging, networking, and researching site for computer science researchers.
Features include allowing users to create and publish articles, find and review papers on arxiv.org (usage of an external API),
upload and convert (using Amazon Textract) research paper PDFs into a more web-friendly format, and subscribe to other users (or new articles on arxiv.org) to receive notifications of new publications.
These desired features warrant the development of a full stack web application (built with S3 and CloudFront for the frontend, ECS for the backend, and DynamoDB for the database), using the arxiv.org API, Amazon Textract, a mechanism to parallelise and distribute long running conversion tasks (Amazon SQS and Lambda), and a mechanism to manage and send notifications (Amazon SNS).
More features are also possible if more nuance and depth is required, such as PDF generation and downloading of articles (a long running task that could be queued on SQS and executed on a Lambda), data warehousing of application and user-interaction events (extracting analytics about the viewership of your blogs), or integrating multi-modal content such as audio and video within blogs.
To describe the infrastructure in a more rigorous and sane way, AWS CloudFormation and CDK will be employed to configure and deploy the project's stack.
