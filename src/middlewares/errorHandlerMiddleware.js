const handleErrors = (err, req, res, next) => {
    
    const message = err.message || 'Internal Server Error';
    const statusCode = err.status || 500;
    console.error('Error:', err);
    
    res.status(statusCode).json({
        error: message,
        code: err.code || 'UNKNOWN_ERROR',
    });
};

module.exports = handleErrors;