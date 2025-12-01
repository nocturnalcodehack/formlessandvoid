# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY markathas-nextjs-com .

#WORKDIR /app/python

# Install Python 3.13 and other dependencies
#ENV PYTHONUNBUFFERED=1
#RUN apk add --update --no-cache python3.13 py3-pip && ln -sf python3 /usr/bin/python
#RUN python3 -m venv venv
#RUN source venv/bin/activate
#RUN pip3 install --no-cache --upgrade pip setuptools

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["./startup.sh"]