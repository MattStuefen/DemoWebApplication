function createError(msg, id) {
    var err = new Error(msg, id);
    err.status = id;
    return err;
}

module.exports = {
    unauthorized: createError('Unauthorized', 401),
    internalError: createError('Internal Server Error', 500)
};
