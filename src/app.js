const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


const {Router} = require('./routes/router')
const handleErrors = require('./middlewares/errorHandlerMiddleware')

app.use(express.json())
app.use(Router);
app.use(handleErrors);

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
}); 

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });
}