const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    const response = { error: message };
    if (err.conflicts) response.conflicts = err.conflicts;
    if (err.details) response.details = err.details;
    res.status(status).json(response);
  };
  
  export default errorHandler;