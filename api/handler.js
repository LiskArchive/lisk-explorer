/**
 * @todo This should move to utilities
 *
 * @param {Object} api - Api constructor instance
 * @param {String} endpoint - The name of the endpoint on the Api object
 * @param {any} param - The parameter to be passed to endpoint. Can be of any interface
 * @param {Object} req - Default ExpressJS Api endpoint request object
 * @param {Object} res - Default ExpressJS Api endpoint response object
 * @param {Object} next - Default ExpressJS next hook
 *
 * @returns {Object} error or Api call value
 */
module.exports = (api, endpoint, param, req, res, next) => {
	if (!api || !api[endpoint]) {
		return new Error('The given endpoint is not defined in the given Api');
	}
	return api[endpoint].call(
		api,
		param,
		(data) => {
			res.json(data);
		},
		(data) => {
			req.json = data;
			return next();
		});
};
