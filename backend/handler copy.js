module.exports.testLambda = async (event, context, callback) => {
  try {
    const response = {
      statusCode: 200,
      headers: {
        "x-custom-header": "My Header Value",
      },
      body: JSON.stringify({ message: "Hello World!" }),
    };

    callback(null, response);
  } catch (error) {
    console.error(error);
    return error;
  }
};
