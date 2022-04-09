
const request = require('request');
const apiOptions = {
 // server: 'http://127.0.0.1:3000'
    server: 'http://127.0.0.1:8080'
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'http://127.0.0.1:8080';
}
    const selfexecutefunc = (req, res) => {
        console.log("inside self execution");
        const path = '/api/HirerUser';
        const requestOptions = {
          url: `${apiOptions.server}${path}`,
          method: 'GET',
          json: {},
          qs: {
            lng: -0.7992599,
            lat: 51.378091,
            maxDistance: 20
          }
        };
        request(
          requestOptions,
          (err, response, body) => {
            if (err) {
                console.log(err);
              } else if (response.statusCode === 200) {
                console.log(body);
              } else {
                console.log(response.statusCode);
              }
          }
        );
      };

      module.exports={
        selfexecutefunc : selfexecutefunc
    }