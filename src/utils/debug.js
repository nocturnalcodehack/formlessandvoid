const debug = (message, data = null) => {
  // Check if we're in development and DEBUG is true
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === 'true') {
    if (data !== null) {
      console.log(`${message}`, data);
    } else {
      console.log(`${message}`);
    }
  }
};