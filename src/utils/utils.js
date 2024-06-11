const validateJson = (json) => {
  try {
    JSON.parse(json);
    return 1;
  } catch (err) {
    return 0;
  }
};

function getLatestFormConfig(protocols) {}

export { validateJson };
