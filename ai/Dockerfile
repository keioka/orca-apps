# Use an official Python runtime as a parent image
FROM mcr.microsoft.com/playwright/python:latest-amd64

ARG DATABASE_URL
ARG ENV

ENV DATABASE_URL=$DATABASE_URL
ENV ENV=$ENV

RUN echo "ENV: $ENV"
RUN echo "DATABASE_URL: $DATABASE_URL"

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
ADD . /app

ENV HNSWLIB_NO_NATIVE=1  

RUN apt-get autoclean
RUN apt-get autoremove
RUN apt-get update && apt-get install build-essential -y && apt-get install python3.10-dev -y
# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

RUN playwright install

RUN prisma generate --schema=./prisma/schema.prisma

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
