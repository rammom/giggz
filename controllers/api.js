module.exports = { 
    status: (req, res, next) => {
        console.log('here');
        res.status(200).send('ok 👍');
    },
}